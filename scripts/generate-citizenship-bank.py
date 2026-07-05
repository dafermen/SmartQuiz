import json
import re
import sys
from pathlib import Path

import pdfplumber


EN_PDF = Path(r"C:\Users\dafer\Downloads\2025-Civics-Test-128-Questions-and-Answers.pdf")
ES_PDF = Path(r"C:\Users\dafer\Downloads\128-Civics-Questions-and-Answers-Spanish.pdf")
OUT_JSON = Path(r"C:\Projects\SmartQuiz\src\components\data\usCitizenship2025Questions.json")


MAJOR_CATEGORY_BY_HEADING = {
    "AMERICAN GOVERNMENT": "module_1",
    "AMERICAN HISTORY": "module_2",
    "INTEGRATED CIVICS": "module_3",
    "GOBIERNO ESTADOUNIDENSE": "module_1",
    "HISTORIA ESTADOUNIDENSE": "module_2",
    "CIVISMO INTEGRADO": "module_3",
}


def extract_lines(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    return [line.strip() for line in text.splitlines() if line.strip()]


def is_noise(line):
    return (
        re.fullmatch(r"\d{1,2}( of \d{1,2} uscis\.gov/citizenship)?", line)
        or line == "uscis.gov/citizenship"
        or line.startswith("M-1778")
        or line == "128 Civics Questions and Answers (2025 version)"
        or line == "128 preguntas y respuestas de civismo (versión 2025)"
        or line.startswith("Listed below are")
        or line.startswith("These questions cover")
        or line.startswith("test is an oral")
        or line.startswith("questions. You must")
        or line.startswith("of the civics test")
        or line.startswith("On the civics test")
        or line.startswith("uscis.gov/citizenship/testupdates")
        or line.startswith("test. You must")
        or line.startswith("naturalization interview")
        or line.startswith("Although USCIS")
        or line.startswith("applicants are encouraged")
        or line.startswith("65/20 Special Consideration")
        or line.startswith("If you are 65")
        or line.startswith("resident of the United States")
        or line.startswith("have been marked")
        or line == "*"
        or line.startswith("the civics test in")
        or line.startswith("the 20 civics test")
        or line.startswith("60%) correctly")
    )


def clean_question_text(text):
    text = text.replace("“", '"').replace("”", '"').replace("’", "'")
    return re.sub(r"\s+", " ", text).strip()


def clean_answer_text(text):
    text = text.replace("“", '"').replace("”", '"').replace("’", "'")
    text = re.sub(r"\s+", " ", text).strip()
    return text.rstrip()


def parse_blocks(lines):
    blocks = []
    current = None
    current_category = "module_1"
    current_block_name = ""
    current_block_id = 1

    for raw_line in lines:
        if is_noise(raw_line):
            continue

        heading = raw_line.upper()
        if heading in MAJOR_CATEGORY_BY_HEADING:
            current_category = MAJOR_CATEGORY_BY_HEADING[heading]
            current_block_name = raw_line.title()
            current_block_id = {"module_1": 1, "module_2": 2, "module_3": 3}[current_category]
            continue

        if re.match(r"^[A-Z]:\s+", raw_line):
            current_block_name = raw_line.split(":", 1)[1].strip()
            if current_block_name in {"Symbols", "Holidays", "Símbolos", "Días feriados"}:
                current_category = "module_3"
                current_block_id = 3
            continue

        question_match = re.match(r"^(\d{1,3})\.\s+(.*)", raw_line)
        if question_match:
            current = {
                "number": int(question_match.group(1)),
                "category": current_category,
                "block_id": current_block_id,
                "block_name": current_block_name or current_category,
                "question": question_match.group(2),
                "answers": [],
                "special_65_20": raw_line.rstrip().endswith("*"),
            }
            blocks.append(current)
            continue

        if current is None:
            continue

        if raw_line.startswith(("•", "●")):
            current["answers"].append(raw_line[1:].strip())
        elif current["answers"]:
            current["answers"][-1] = f"{current['answers'][-1]} {raw_line}".strip()
        else:
            current["question"] = f"{current['question']} {raw_line}".strip()

    for block in blocks:
        block["question"] = clean_question_text(block["question"]).replace(" *", "").strip()
        block["answers"] = [clean_answer_text(answer) for answer in block["answers"] if clean_answer_text(answer)]
    return blocks


def dedupe_by_number(blocks):
    by_number = {}
    for block in blocks:
        by_number.setdefault(block["number"], []).append(block)
    return by_number


def make_options(answers, all_answers, number):
    correct_count = min(len(answers), 4)
    correct_answers = list(range(correct_count))
    options = answers[:4]

    distractor_pool = [
        answer for answer in all_answers
        if answer not in answers and len(answer) <= 100
    ]
    cursor = (number * 7) % max(1, len(distractor_pool))
    while len(options) < 4 and distractor_pool:
        candidate = distractor_pool[cursor % len(distractor_pool)]
        if candidate not in options:
            options.append(candidate)
        cursor += 1

    while len(options) < 4:
        options.append("Review the official answer list")

    return options, correct_answers


def difficulty_for(number, special_65_20):
    if special_65_20:
        return "beginner"
    if number <= 45:
        return "intermediate"
    return "advanced"


def build_question(block, language, all_answers):
    options, correct_answers = make_options(block["answers"], all_answers, block["number"])
    answer_label = "Accepted answers" if language == "en" else "Respuestas aceptadas"

    return {
        "id": f"uscis-2025-{block['number']:03d}",
        "category": block["category"],
        "block_id": block["block_id"],
        "block_name": block["block_name"],
        "difficulty": difficulty_for(block["number"], block["special_65_20"]),
        "tags": [
            "uscis-2025",
            "civics",
            block["category"],
            "65-20" if block["special_65_20"] else "standard",
        ],
        "question": block["question"],
        "options": options,
        "correct_answer": 0,
        "correct_answers": correct_answers,
        "explanation": f"{answer_label}: " + "; ".join(block["answers"]),
    }


def main():
    en_blocks = parse_blocks(extract_lines(EN_PDF))
    es_blocks_by_number = dedupe_by_number(parse_blocks(extract_lines(ES_PDF)))

    en_by_number = {block["number"]: block for block in en_blocks if 1 <= block["number"] <= 128}
    es_by_number = {}
    for number, blocks in es_blocks_by_number.items():
        if 1 <= number <= 128 and len(blocks) >= 2:
            es_by_number[number] = blocks[1]

    missing_en = sorted(set(range(1, 129)) - set(en_by_number))
    missing_es = sorted(set(range(1, 129)) - set(es_by_number))
    if missing_en or missing_es:
        raise RuntimeError(f"Missing questions. en={missing_en} es={missing_es}")

    en_answers = [answer for block in en_by_number.values() for answer in block["answers"]]
    es_answers = [answer for block in es_by_number.values() for answer in block["answers"]]

    payload = {
        "en": [build_question(en_by_number[number], "en", en_answers) for number in range(1, 129)],
        "es": [build_question(es_by_number[number], "es", es_answers) for number in range(1, 129)],
    }

    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT_JSON}")
    print(f"English questions: {len(payload['en'])}")
    print(f"Spanish questions: {len(payload['es'])}")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
