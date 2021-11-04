import {Component, Element, Event, EventEmitter, h, Host, Listen, Prop, State, Watch} from '@stencil/core';
import {HostElement} from "../../decorators";

const ORGANIZER_CUSTOM_EL_NAME = "organizer-item-popover";

@Component({
  tag: 'pdm-item-organizer',
  styleUrl: 'pdm-item-organizer.css',
  shadow: false,
})
export class PdmItemOrganizer {

  @HostElement() host: HTMLElement;

  @Element() element;

  @Event()
  selectEvent: EventEmitter<string>

  /**
   * display-count": The number of items to display (minimum is 0), defaults to 3
   * display-count-divider: separate/break content into corresponding value
   */
  @Prop({attribute: "display-count"}) displayCount: number = 3;
  @Prop({attribute: "display-count-divider"}) displayCountDivider: number = 170;

  /**
   * the Tag for the component to be rendered
   */
  @Prop({attribute: "component-name", mutable: true}) componentName: string = undefined;
  /**
   * the list of props that will be passed to the HTML Element {@link componentName}
   */
  @Prop({attribute: "component-props", mutable: true}) componentProps: string = undefined;
  /**
   * The identifying prop to be return upon click (must exist in the supplied {@link componentProps}
   */
  @Prop({attribute: "id-prop"}) idProp: string = undefined;

  @Prop({attribute: "orientation", mutable: true}) orientation: "between" | "end" | "evenly" | "around" | "center" | "start" = "end";

  @Prop({attribute: "single-line", mutable: true}) singleLine: boolean = true;

  @Prop({attribute: "more-label"}) moreLabel: string = undefined;

  @Prop({attribute: "more-icon"}) moreIcon: string = "ellipsis-horizontal";

  /**
   * If the component does not generate an ion-item (so it can be handled by an ion-list)
   * this must be set to false
   */
  @Prop({attribute: "is-ion-item"}) isItem: boolean = true;

  @Prop({attribute: 'more-chips-position'}) moreChipsPosition: "start" | "end" = this.orientation === "end" || this.singleLine ? "start" : "end";

  @State()
  private parsedProps: [{}] = undefined;

  @State()
  private _displayCount: number = this.displayCount;

  @Watch("componentProps")
  updateParsedProps(newProps){
    if (!newProps)
      this.parsedProps = undefined;
    else {
      const oldProps = this.parsedProps;
      const equals = [];
      let parsedProps: [{}];
      try {
        parsedProps = JSON.parse(newProps);
      } catch (e){
        console.log("could not parse props");
        this.parsedProps = undefined;
        return;
      }

      if (Array.isArray(oldProps) && Array.isArray(parsedProps)){
        parsedProps.forEach((p,i) => {
          try {
            if (p[this.idProp] === oldProps[i][this.idProp])
              equals.push(i);
          } catch (e) {
            // ignore. means parsedProps has more that before
          }
        });
      }

      // @ts-ignore
      this.parsedProps = [...parsedProps];

      this.element.querySelectorAll(`${this.componentName}`).forEach(async (e,i) => {
        if (equals.indexOf(i) !== -1)
          if (e.refresh)
            await e.refresh();
      });
    }
  }

  @Listen('resize', {target: 'window'})
  async windowResizeListener() {
    this.calculateDisplayCount(this.element.offsetWidth, this.displayCountDivider);
  }

  private definePopOverContent(){
    const self = this;

    if (!!customElements.get(ORGANIZER_CUSTOM_EL_NAME))
      return;

    customElements.define(ORGANIZER_CUSTOM_EL_NAME, class extends HTMLElement{
      connectedCallback(){
        const contentEl = this;
        const popOverElement: any = document.querySelector('ion-popover');
        const {displayCount, parsedProps, componentName, isItem} = popOverElement.componentProps;
        const listTag = isItem ? 'ion-list' : 'ul';
        this.innerHTML = `
<ion-content>
  <${listTag} class="organizer-pop-over-list">
    ${parsedProps.filter((props, i) => !!props && i >= displayCount)
          .map(props => self.getComponentLiteral(isItem, componentName, props)).join('')}
  </${listTag}>
</ion-content>`;

        this.querySelectorAll(componentName).forEach((item, index) => {
          const el = parsedProps.filter((parsedProp) => {
            return parsedProp['gtin-batch'] === item.getAttribute(self.idProp)
          })[0];

          item.addEventListener('click', () => {
            const popover: any = contentEl.closest('ion-popover');
            let data;
            if (!el) {
              data = item.getAttribute(self.idProp)
            } else {
              data = el.hasOwnProperty('event-data') ? el['event-data'] : item.getAttribute(self.idProp)
            }
            item.getAttribute(self.idProp)
            popover.dismiss(undefined, data);
          });
        });
      }
    });
  }

  private getComponentLiteral(isItem, componentName, props){
    const getNotIonItemListItem = function(isClose?){
      if (isItem)
        return '';
      return `<${isClose ? '/' : ''}li>`
    }
    return `${getNotIonItemListItem()}<${componentName}${Object.keys(props).reduce((accum, prop) => {
      return accum + ` ${prop}="${props[prop]}"`
    }, '')}></${componentName}>${getNotIonItemListItem(true)}`;
  }

  private async getItemPopOver(evt){
    this.definePopOverContent();
    const popover: any = Object.assign(document.createElement('ion-popover'), {
      component: ORGANIZER_CUSTOM_EL_NAME,
      cssClass: 'organizer-popover',
      translucent: true,
      event: evt,
      showBackdrop: false,
      animated: true,
      backdropDismiss: true,
      componentProps: {
        displayCount: this._displayCount,
        parsedProps: this.parsedProps,
        componentName: this.componentName,
        isItem: this.isItem
      }
    });
    document.body.appendChild(popover);
    await popover.present();

    const {role} = await popover.onWillDismiss();
    if (role && role !== 'backdrop'){
      this.selectEvent.emit(role);
    }
  }

  @Listen('ssapp-show-more')
  async showMore(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    await this.getItemPopOver(evt.detail);
  }

  private triggerSelect(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.selectEvent.emit(evt.detail);
  }

  private getComponentJSX(props){
    const self = this;
    const Tag = this.componentName;
    return (<Tag {...props} onSelectEvent={self.triggerSelect.bind(self)}></Tag>)
  }

  private getFilteredComponents(){
    if (!this.parsedProps || !this.parsedProps.length)
      return [];
    if (this.parsedProps.length <= this._displayCount)
      return this.parsedProps.map(props => this.getComponentJSX(props));
    const toDisplay = Math.max(this._displayCount, 0) - 1;
    const result = this.parsedProps.filter((props,i) => !!props && i <= toDisplay).map(props => this.getComponentJSX(props));

    if (this.singleLine || this._displayCount < 0){
      const operation = this.moreChipsPosition === "start" ? result.unshift.bind(result) : result.push.bind(result);
      operation(<more-chip float-more-button={!this.singleLine} label={this.moreLabel || ""} icon-name={this.moreIcon || ""}></more-chip>);
    }
    return result;
  }

  private selectRenderMode(){
    if (this._displayCount >= 0) {
      return (
        <ion-row
          class={`${this.singleLine ? "flex " : "flex-break "} ion-justify-content-${this.orientation} ion-align-items-end`}>
          <ion-col size="auto">
            {...this.getFilteredComponents()}
          </ion-col>
        </ion-row>
      );
    }

    return (
      this.getFilteredComponents()[0]
    )
  }

  private calculateDisplayCount(width: number, divider: number) {
    const calc = width > 0 ? Math.trunc(width / divider) : this._displayCount;
    if (this._displayCount !== calc) {
      this._displayCount = calc;
    }
  }

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.updateParsedProps(this.componentProps);

    const checkElementSize = () => {
      if (!this.element.offsetWidth && !this.element.offsetHeight) {
        return requestAnimationFrame(checkElementSize);
      }
      this.calculateDisplayCount(this.element.offsetWidth, this.displayCountDivider);
    }
    checkElementSize();
  }

  render() {
    if (!this.host.isConnected)
      return;

    return (
      <Host>
        {this.selectRenderMode()}
      </Host>
    );
  }
}
