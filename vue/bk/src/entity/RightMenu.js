export class RightMenu {
    id; label; event;
    constructor(label, event) {
        this.id = dinglj.uuid('right-click-item');
        this.label = label;
        this.event = event;
    }
}