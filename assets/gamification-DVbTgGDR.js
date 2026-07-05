import{v as d,Z as y,a8 as f}from"./index-v3_oVMfr.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]],w=d("Target",v);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]],L=d("TrendingUp",h);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["path",{d:"M6 9H4.5a2.5 2.5 0 0 1 0-5H6",key:"17hqa7"}],["path",{d:"M18 9h1.5a2.5 2.5 0 0 0 0-5H18",key:"lmptdp"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22",key:"1nw9bq"}],["path",{d:"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22",key:"1np0yb"}],["path",{d:"M18 2H6v7a6 6 0 0 0 12 0V2Z",key:"u46fv3"}]],M=d("Trophy",m),g="smartquiz_gamification_profile",a=250,l={totalXp:0,level:1,completedQuizzes:0,passedQuizzes:0,perfectScores:0,updatedAt:null},x=()=>typeof window<"u"&&window.localStorage,u=t=>Math.floor(Math.max(0,t)/a)+1,k=t=>{const o=Math.max(0,t)%a;return{currentLevelXp:o,xpForNextLevel:a,percentage:Math.round(o/a*100)}},X=()=>{try{const t=y("gamification_profile",l,g),o=Number(t.totalXp)||0;return{...l,...t,totalXp:o,level:u(o)}}catch{return l}},z=({percentage:t,passed:o,answerResults:p=[]})=>{const c=p.filter(e=>e.is_correct),n=c.filter(e=>e.difficulty==="advanced").length,s=c.filter(e=>e.difficulty==="intermediate").length,r=[{key:"completedQuizXp",xp:10},{key:"correctAnswersXp",xp:c.length*2},{key:"intermediateBonusXp",xp:s*1},{key:"advancedBonusXp",xp:n*3},{key:"passingBonusXp",xp:o?25:0},{key:"highScoreBonusXp",xp:t>=90?15:0},{key:"perfectScoreBonusXp",xp:t===100?35:0}].filter(e=>e.xp>0);return{earnedXp:r.reduce((e,i)=>e+i.xp,0),breakdown:r}},S=({percentage:t,passed:o,answerResults:p})=>{const c=X(),n=c.level,s=z({percentage:t,passed:o,answerResults:p}),r=c.totalXp+s.earnedXp,e=u(r),i={...c,totalXp:r,level:e,completedQuizzes:c.completedQuizzes+1,passedQuizzes:c.passedQuizzes+(o?1:0),perfectScores:c.perfectScores+(t===100?1:0),updatedAt:new Date().toISOString()};return x()&&f("gamification_profile",i),{...s,previousLevel:n,level:e,leveledUp:e>n,totalXp:r,levelProgress:k(r)}};export{w as T,L as a,M as b,S as c,k as d,X as g};
