import{f as i}from"./index-BT6NFdiI.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]],_=i("Clock",g);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]],S=i("Target",k);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]],w=i("TrendingUp",v);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["path",{d:"M6 9H4.5a2.5 2.5 0 0 1 0-5H6",key:"17hqa7"}],["path",{d:"M18 9h1.5a2.5 2.5 0 0 0 0-5H18",key:"lmptdp"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22",key:"1nw9bq"}],["path",{d:"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22",key:"1np0yb"}],["path",{d:"M18 2H6v7a6 6 0 0 0 12 0V2Z",key:"u46fv3"}]],L=i("Trophy",m),u="smartquiz_gamification_profile",p=250,a={totalXp:0,level:1,completedQuizzes:0,passedQuizzes:0,perfectScores:0,updatedAt:null},y=()=>typeof window<"u"&&window.localStorage,f=t=>Math.floor(Math.max(0,t)/p)+1,h=t=>{const o=Math.max(0,t)%p;return{currentLevelXp:o,xpForNextLevel:p,percentage:Math.round(o/p*100)}},x=()=>{if(!y())return a;try{const t=localStorage.getItem(u);if(!t)return a;const o=JSON.parse(t),n=Number(o.totalXp)||0;return{...a,...o,totalXp:n,level:f(n)}}catch{return a}},X=({percentage:t,passed:o,answerResults:n=[]})=>{const c=n.filter(e=>e.is_correct),s=c.filter(e=>e.difficulty==="advanced").length,l=c.filter(e=>e.difficulty==="intermediate").length,r=[{key:"completedQuizXp",xp:10},{key:"correctAnswersXp",xp:c.length*2},{key:"intermediateBonusXp",xp:l*1},{key:"advancedBonusXp",xp:s*3},{key:"passingBonusXp",xp:o?25:0},{key:"highScoreBonusXp",xp:t>=90?15:0},{key:"perfectScoreBonusXp",xp:t===100?35:0}].filter(e=>e.xp>0);return{earnedXp:r.reduce((e,d)=>e+d.xp,0),breakdown:r}},M=({percentage:t,passed:o,answerResults:n})=>{const c=x(),s=c.level,l=X({percentage:t,passed:o,answerResults:n}),r=c.totalXp+l.earnedXp,e=f(r),d={...c,totalXp:r,level:e,completedQuizzes:c.completedQuizzes+1,passedQuizzes:c.passedQuizzes+(o?1:0),perfectScores:c.perfectScores+(t===100?1:0),updatedAt:new Date().toISOString()};return y()&&localStorage.setItem(u,JSON.stringify(d)),{...l,previousLevel:s,level:e,leveledUp:e>s,totalXp:r,levelProgress:h(r)}};export{_ as C,S as T,w as a,L as b,M as c,h as d,x as g};
