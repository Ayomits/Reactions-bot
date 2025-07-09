export class TextMessageBuilder {
  private msg: string

  constructor(msg: string = "") {
    this.msg = msg
  }

  public setParagraph() {
    this.msg += "\n"
    return this
  }

  public setSpan(text: string) {
    this.msg += text
    return this
  }

  public setSpace(count = 1) {
    this.msg += " ".repeat(count)
    return this
  }

  /**
   * It sets string like `{option}:{value}`
   * @returns
   */
  public setOption(option: string, value: string) {
    this.msg += `${option}:${value}`
    return this
  }

  public toPlain() {
    return this.msg
  }
}
