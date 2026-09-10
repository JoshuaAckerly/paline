import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const html = fs.readFileSync(path.join(root,"index.html"),"utf8");
const jsPath = path.join(root,"src","app.js");
const js = fs.readFileSync(jsPath,"utf8");
const css = fs.readFileSync(path.join(root,"src","styles.css"),"utf8");
let failed = false;

const syntax = spawnSync(process.execPath,["--check",jsPath],{encoding:"utf8"});
if (syntax.status !== 0) { console.error(syntax.stderr); failed = true; }
else console.log("PASS JavaScript syntax");

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const dup = [...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))];
if (dup.length) { console.error("FAIL duplicate IDs:",dup); failed = true; }
else console.log("PASS duplicate static IDs");

const markers = [
  "individual availability",
  "Songbook",
  "Master Calendar",
  "Full PA LINE",
  "AVAILABLE",
  "NEED TO TALK",
  "IndexedDB",
  "Rehearsals",
  "Band Meetings",
  "Crew Chat",
  "Weekly Ops"
];
const haystack = (html+js+css).toLowerCase();
for (const marker of markers) {
  if (!haystack.includes(marker.toLowerCase())) { console.error("FAIL missing marker:",marker); failed = true; }
  else console.log("PASS marker:",marker);
}

const requiredFunctions = [
  "lineupAvailability","memberAvailability","respondToOffer","confirmOffer",
  "openBlockForm","simulateCalendarConnect","importICS","openSongForm",
  "bindPracticePlayer","songState","renderSongbookPage","renderCalendarPage",
  "renderRehearsalsPage","renderMeetingsPage","renderChatPage","internalCommitmentConflictsFor",
  "renderWeeklyOpsPage","getWeeklyPlan","toggleWeeklyTask","toggleWeeklySubtask","actualCompletionCredits","offerPayoutSummary","renderOfferPayout","attendanceEstimateFor","merchForecastForAttendance","merchSplit","renderAttendanceMerch","commitmentTimeline","renderCommitmentTimeline","renderSetlistBuilder","openSetlistBuilder"
];
for (const fn of requiredFunctions) {
  if (!js.includes(`function ${fn}`)) { console.error("FAIL missing function:",fn); failed = true; }
}
console.log(`Checked ${requiredFunctions.length} critical backend functions.`);
process.exit(failed ? 1 : 0);
