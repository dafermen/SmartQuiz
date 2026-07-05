import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { getMobileSettings } from "@/components/data/learningStorage";

const DAILY_REMINDER_ID = 70101;

const getNextReminderDate = (hour) => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  if (date.getTime() <= Date.now()) {
    date.setDate(date.getDate() + 1);
  }
  return date;
};

export const configureDailyReminder = async (settings = getMobileSettings()) => {
  if (!Capacitor.isNativePlatform()) return false;

  await LocalNotifications.cancel({ notifications: [{ id: DAILY_REMINDER_ID }] });

  if (!settings.remindersEnabled) return false;

  const permission = await LocalNotifications.requestPermissions();
  if (permission.display !== "granted") return false;

  await LocalNotifications.schedule({
    notifications: [
      {
        id: DAILY_REMINDER_ID,
        title: "SmartQuiz",
        body: `Practice ${settings.dailyGoal || 10} questions today.`,
        schedule: {
          at: getNextReminderDate(settings.reminderHour || 19),
          repeats: true,
          every: "day"
        }
      }
    ]
  });

  return true;
};
