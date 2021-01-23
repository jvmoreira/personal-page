class Vertex {

    static vertexRadius = 6;

    get id() { return this._id; }
    get x() { return this._x; }
    get y() { return this._y; }
    get coordinate() { return [this.x, this.y]; }
    getElement() { return this._element; }

    constructor(x, y) {
        this._id = getUniqueId();
        this.buildElement();
        this.translate(x, y);
    }

    translate(x, y) {
        this.translateX(x);
        this.translateY(y);
        customEvents.dispatch("vertexTranslated", this.id);
    }

    translateX(x) {
        this._x = x;
        this.getElement().setAttribute("cx", this.x.toString());
    }

    translateY(y) {
        this._y = y;
        this.getElement().setAttribute("cy", this.y.toString());
    }

    buildElement() {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.setElementStyle();
        this.setElementListeners();

        customEvents.dispatch("appendChild", this.getElement());
    }

    setElementStyle() {
        this.getElement().setAttribute("r", Vertex.vertexRadius.toString());
        this.getElement().setAttribute("stroke", "none");
        this.getElement().classList.add("cursor-pointer");
    }

    setElementListeners() {
        this.getElement().oncontextmenu = (event) => event.preventDefault();
        this.getElement().onmouseup = () => customEvents.dispatch("clearOperation");

        this.getElement().onmousedown = (event) => {
            switch(event.button) {
                case MouseButton.LEFT:
                    return this.handleLeftButtonClick();
                case MouseButton.RIGHT:
                    return this.handleRightButtonClick();
            }
        }
    }

    handleLeftButtonClick() {
        customEvents.dispatch("translateOperation", [this.id]);
    }

    handleRightButtonClick() {
        customEvents.dispatch("deleteVertex", [this.id]);
    }
}
