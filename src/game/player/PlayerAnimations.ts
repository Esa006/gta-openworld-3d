export type AnimationState = 'IDLE' | 'WALK' | 'RUN' | 'SPRINT' | 'JUMP' | 'CARJACK';

export interface LimbPose {
  leftLegRotX: number;
  rightLegRotX: number;
  leftArmRotX: number;
  rightArmRotX: number;
  leftArmRotZ: number;
  rightArmRotZ: number;
  torsoLeanX: number;
  headYaw: number;
  bagBounceZ: number;
}

export function computeLimbPose(
  state: AnimationState,
  time: number,
  isAiming: boolean = false
): LimbPose {
  switch (state) {
    case 'SPRINT': {
      const walkCycle = time * 16.0;
      const stride = 0.88;
      return {
        leftLegRotX: Math.sin(walkCycle) * stride,
        rightLegRotX: -Math.sin(walkCycle) * stride,
        leftArmRotX: -Math.sin(walkCycle) * (stride * 0.95),
        rightArmRotX: isAiming ? -0.55 : Math.sin(walkCycle) * (stride * 0.95),
        leftArmRotZ: 0.1,
        rightArmRotZ: -0.1,
        torsoLeanX: 0.16,
        headYaw: 0,
        bagBounceZ: 0.35 + Math.sin(walkCycle) * 0.08,
      };
    }
    case 'RUN': {
      const walkCycle = time * 12.0;
      const stride = 0.72;
      return {
        leftLegRotX: Math.sin(walkCycle) * stride,
        rightLegRotX: -Math.sin(walkCycle) * stride,
        leftArmRotX: -Math.sin(walkCycle) * 0.65,
        rightArmRotX: isAiming ? -0.55 : Math.sin(walkCycle) * 0.65,
        leftArmRotZ: 0.08,
        rightArmRotZ: -0.08,
        torsoLeanX: 0.09,
        headYaw: 0,
        bagBounceZ: 0.35 + Math.sin(walkCycle) * 0.05,
      };
    }
    case 'WALK': {
      const walkCycle = time * 8.5;
      const stride = 0.55;
      return {
        leftLegRotX: Math.sin(walkCycle) * stride,
        rightLegRotX: -Math.sin(walkCycle) * stride,
        leftArmRotX: -Math.sin(walkCycle) * 0.45,
        rightArmRotX: isAiming ? -0.55 : Math.sin(walkCycle) * 0.45,
        leftArmRotZ: 0.05,
        rightArmRotZ: -0.05,
        torsoLeanX: 0.04,
        headYaw: Math.sin(time * 1.5) * 0.05,
        bagBounceZ: 0.35 + Math.sin(walkCycle) * 0.03,
      };
    }
    case 'JUMP': {
      return {
        leftLegRotX: 0.3,
        rightLegRotX: -0.2,
        leftArmRotX: -0.6,
        rightArmRotX: isAiming ? -0.55 : -0.6,
        leftArmRotZ: 0.25,
        rightArmRotZ: -0.25,
        torsoLeanX: 0.05,
        headYaw: 0,
        bagBounceZ: 0.38,
      };
    }
    case 'CARJACK': {
      // Reaching forward left arm to yank door handle
      return {
        leftLegRotX: 0.1,
        rightLegRotX: -0.1,
        leftArmRotX: -1.2, // reaching forward
        rightArmRotX: -0.4, // braced
        leftArmRotZ: 0.15,
        rightArmRotZ: -0.15,
        torsoLeanX: 0.18,
        headYaw: -0.2,
        bagBounceZ: 0.36,
      };
    }
    case 'IDLE':
    default: {
      const breath = Math.sin(time * 2.0);
      return {
        leftLegRotX: 0,
        rightLegRotX: 0,
        leftArmRotX: 0.04 + breath * 0.02,
        rightArmRotX: isAiming ? -0.65 : 0.04 + breath * 0.02,
        leftArmRotZ: 0.04,
        rightArmRotZ: -0.04,
        torsoLeanX: breath * 0.015,
        headYaw: Math.sin(time * 0.8) * 0.06,
        bagBounceZ: 0.35,
      };
    }
  }
}
