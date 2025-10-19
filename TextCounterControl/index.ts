import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class TextCounterControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private _container: HTMLDivElement;
  private _value: string | null = null;
  private _maxLength = 100;
  private _enforceLimit = false;
  private _notifyOutputChanged: () => void;

  private _input: HTMLInputElement;
  private _info: HTMLDivElement;

  public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
    this._notifyOutputChanged = notifyOutputChanged;
    this._container = container;

    // Lees init-waarden
    this._value = context.parameters.value.raw ?? "";
    this._maxLength = Number(context.parameters.maxLength?.raw ?? 100);
    this._enforceLimit = (context.parameters.enforceLimit?.raw ?? false) as boolean;

    // Bouw UI
    this._input = document.createElement("input");
    this._input.type = "text";
    this._input.value = this._value ?? "";
    this._input.style.width = "100%";

    this._info = document.createElement("div");
    this._info.style.fontSize = "12px";

    // Events
    this._input.addEventListener("input", () => {
      let current = this._input.value;
      if (this._enforceLimit && current.length > this._maxLength) {
        current = current.substring(0, this._maxLength);
        this._input.value = current;
      }
      this._value = current;
      this.updateInfo();
      this._notifyOutputChanged();
    });

    container.appendChild(this._input);
    container.appendChild(this._info);

    this.updateInfo();
    this.applyDisabled(context);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    // Bij updates (bv. form state / disabled) waardes opnieuw lezen
    this._maxLength = Number(context.parameters.maxLength?.raw ?? 100);
    this._enforceLimit = (context.parameters.enforceLimit?.raw ?? false) as boolean;

    if (context.parameters.value.raw !== this._value) {
      this._value = context.parameters.value.raw ?? "";
      this._input.value = this._value;
    }

    this.applyDisabled(context);
    this.updateInfo();
  }

  public getOutputs(): IOutputs {
    return { value: this._value ?? "" };
  }

  public destroy(): void {
    // Cleanup indien nodig
  }

  private updateInfo(): void {
    const used = (this._value ?? "").length;
    const left = this._maxLength - used;
    this._info.textContent = `Tekens: ${used}/${this._maxLength} (${left >= 0 ? left : 0} over)`;
    this._info.style.color = left < 0 ? "red" : "";
  }

  private applyDisabled(context: ComponentFramework.Context<IInputs>): void {
    const isDisabled = context.mode.isControlDisabled;
    this._input.disabled = isDisabled;
  }
}
