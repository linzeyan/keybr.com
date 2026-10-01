export class KeyModifier {
  static readonly None = new KeyModifier(/* shift= */ false, /* alt= */ false);
  static readonly Shift = new KeyModifier(/* shift= */ true, /* alt= */ false);
  static readonly Alt = new KeyModifier(/* shift= */ false, /* alt= */ true);
  static readonly ShiftAlt = new KeyModifier(
    /* shift= */ true,
    /* alt= */ true,
  );
  // An input method like Microsoft Bopomofo types the punctuation with the
  // control key.
  static readonly Ctrl = new KeyModifier(
    /* shift= */ false,
    /* alt= */ false,
    /* ctrl= */ true,
  );
  static readonly ShiftCtrl = new KeyModifier(
    /* shift= */ true,
    /* alt= */ false,
    /* ctrl= */ true,
  );

  static from(shift: boolean, alt: boolean, ctrl = false) {
    if (ctrl) {
      return shift ? KeyModifier.ShiftCtrl : KeyModifier.Ctrl;
    }
    if (shift && alt) {
      return KeyModifier.ShiftAlt;
    }
    if (shift) {
      return KeyModifier.Shift;
    }
    if (alt) {
      return KeyModifier.Alt;
    }
    return KeyModifier.None;
  }

  readonly shift: boolean;
  readonly alt: boolean;
  readonly ctrl: boolean;
  readonly complexity: number;

  private constructor(shift: boolean, alt: boolean, ctrl = false) {
    this.shift = shift;
    this.alt = alt;
    this.ctrl = ctrl;
    this.complexity = Number(shift) + Number(alt) + Number(ctrl);
  }
}
