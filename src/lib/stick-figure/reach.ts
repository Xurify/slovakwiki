import { REST_POSE, type StickPose } from "./pose";
import { solveRig, type Point, type SitPath } from "./rig";

/** The arm bones in rig.ts: upper arm, forearm. */
const UPPER_ARM = 15;
const FOREARM = 14;
const RAD = Math.PI / 180;

export type Hand = "lead" | "rear";

/** `angle` in degrees from straight down, toward +x, as rig.ts measures it. */
function direction(from: Point, to: Point): number {
  return Math.atan2(to.x - from.x, to.y - from.y) / RAD;
}

/** `angle` written as the turn nearest `near`, so a blend from `near` never spins the long way round. */
function nearest(angle: number, near: number): number {
  return angle + 360 * Math.round((near - angle) / 360);
}

/**
 * The raise and bend that put one hand on `target`, in the rig space of a
 * figure facing +x, worked out on `pose` (its lean and sit). The elbow
 * drops below the line to the target, as a relaxed arm's does; a target out
 * of reach gets a straight arm toward it.
 */
export function reachFor(
  pose: StickPose,
  hand: Hand,
  target: Point,
  sit = 0,
): Pick<StickPose, "leadRaise" | "leadBend"> | Pick<StickPose, "rearRaise" | "rearBend"> {
  const rig = solveRig(pose, sit);
  const shoulder = hand === "lead" ? rig.leadShoulder : rig.rearShoulder;
  const side = hand === "lead" ? 1 : -1;
  const span = Math.hypot(target.x - shoulder.x, target.y - shoulder.y);
  const reach = Math.min(
    UPPER_ARM + FOREARM - 0.01,
    Math.max(Math.abs(UPPER_ARM - FOREARM) + 0.01, span),
  );
  const toward = direction(shoulder, target);
  const open =
    Math.acos((UPPER_ARM ** 2 + reach ** 2 - FOREARM ** 2) / (2 * UPPER_ARM * reach)) /
    RAD;

  // Of the two elbows that reach the target, the lower one.
  const uppers = [toward - open, toward + open];
  const elbows = uppers.map((upper) => ({
    upper,
    joint: {
      x: shoulder.x + Math.sin(upper * RAD) * UPPER_ARM,
      y: shoulder.y + Math.cos(upper * RAD) * UPPER_ARM,
    },
  }));
  const { upper, joint } = elbows[0].joint.y >= elbows[1].joint.y ? elbows[0] : elbows[1];
  const fore = span > UPPER_ARM + FOREARM ? upper : direction(joint, target);

  const raise = side * (upper + rig.lean);
  const bend = side * (fore - upper);
  if (hand === "lead") {
    const leadRaise = nearest(raise, pose.leadRaise);
    return { leadRaise, leadBend: nearest(bend, pose.leadBend) };
  }
  const rearRaise = nearest(raise, pose.rearRaise);
  return { rearRaise, rearBend: nearest(bend, pose.rearBend) };
}

/** Where a figure's lips are in rig space, on `pose`, as StickHead draws them on the face. */
export function mouthOf(pose: StickPose, sit = 0, path?: SitPath): Point {
  const { head, headAngle } = solveRig(pose, sit, path);
  const angle = headAngle * RAD;
  // StickHead draws the mouth at x 32 + 2.6 * 0.9 + look * 1.2 and about y 37
  // of its 64-unit space, centred on 32, 29, and the figure scales that by 0.82.
  const ahead = (2.6 * 0.9 + pose.look * 1.2) * 0.82;
  const below = 6.6;
  return {
    x: head.x + Math.cos(angle) * ahead - Math.sin(angle) * below,
    y: head.y + Math.sin(angle) * ahead + Math.cos(angle) * below,
  };
}

/** Seated at a table, an idle hand lies on its top in front, from the shoulder: hanging, the arms went down through it. */
const ON_TABLE: Record<Hand, Point> = { lead: { x: 10, y: 9 }, rear: { x: 6, y: 9.5 } };
/**
 * The studio desk's top is 20 below a seated shoulder (StudioDesk's TOP), so
 * the forearms lie further out on it. Laid at the table's height, the far arm
 * folded up behind the body and the host read as turned away from the mic.
 */
const ON_DESK: Record<Hand, Point> = { lead: { x: 13, y: 19 }, rear: { x: 10, y: 19.5 } };
/** A talking hand this far out from rest, degrees, has left the table for the beat; overTable has already drawn a beat in to 40% of its swing. */
const OFF_TABLE = 8;

/**
 * `pose` with the arms that are at rest laid on the table, by `sit` (0
 * standing to 1 seated). An arm out in a beat comes up off it the further
 * it goes; one folded or raised is left be.
 */
export function restOnTable(
  pose: StickPose,
  sit: number,
  surface: "table" | "desk" = "table",
): StickPose {
  if (sit <= 0) return pose;
  const lay = (hand: Hand, raise: number, bend: number) => {
    const out = Math.abs(
      raise - (hand === "lead" ? REST_POSE.leadRaise : REST_POSE.rearRaise),
    );
    const folded = bend < -30;
    const on = folded ? 0 : sit * Math.max(0, 1 - out / OFF_TABLE);
    if (on <= 0) return { raise, bend };
    const at = (surface === "desk" ? ON_DESK : ON_TABLE)[hand];
    const laid = reachFor(pose, hand, fromShoulder(pose, hand, sit, at), sit);
    const [toRaise, toBend] =
      "leadRaise" in laid
        ? [laid.leadRaise, laid.leadBend]
        : [laid.rearRaise, laid.rearBend];
    return { raise: raise + (toRaise - raise) * on, bend: bend + (toBend - bend) * on };
  };
  const lead = lay("lead", pose.leadRaise, pose.leadBend);
  const rear = lay("rear", pose.rearRaise, pose.rearBend);
  return {
    ...pose,
    leadRaise: lead.raise,
    leadBend: lead.bend,
    rearRaise: rear.raise,
    rearBend: rear.bend,
  };
}

function fromShoulder(pose: StickPose, hand: Hand, sit: number, at: Point): Point {
  const rig = solveRig(pose, sit);
  const shoulder = hand === "lead" ? rig.leadShoulder : rig.rearShoulder;
  return { x: shoulder.x + at.x, y: shoulder.y + at.y };
}
