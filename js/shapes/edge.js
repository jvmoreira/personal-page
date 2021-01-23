class Edge {

    get id() { return this._id; }
    get sourceVertex() { return this._sourceVertex || {}; }
    get destinyVertex() { return this._destinyVertex || {}; }
    getElement() { return this._element; }

    constructor(sourceVertex, destinyVertex) {
        this._id = getUniqueId();
        this.buildElement();
        this.setSourceVertex(sourceVertex);
        this.setDestinyVertex(destinyVertex);
        this.setVertexTranslatedListener();
    }

    translate(x, y) {
        const [referenceCoordinateX, referenceCoordinateY] = this.translateReferenceCoordinate;
        const translateX = x - referenceCoordinateX;
        const translateY = y - referenceCoordinateY;

        this.translateSourceVertex(translateX, translateY);
        this.translateDestinyVertex(translateX, translateY);
    }

    translateSourceVertex(translateX, translateY) {
        const [originalSourceX, originalSourceY] = this.sourceVertexReferenceCoordinate;
        this.sourceVertex.translate(originalSourceX + translateX, originalSourceY + translateY);
    }

    translateDestinyVertex(translateX, translateY) {
        const [originalDestinyX, originalDestinyY] = this.destinyVertexReferenceCoordinate;
        this.destinyVertex.translate(originalDestinyX + translateX, originalDestinyY + translateY);
    }

    setSourceVertex(newSourceVertex) {
        if(this.sourceVertex.id === newSourceVertex.id)
            return;

        this._sourceVertex = newSourceVertex;
        this.updateSourcePosition();
    }

    setDestinyVertex(newDestinyVertex) {
        if(this.destinyVertex.id === newDestinyVertex.id)
            return;

        this._destinyVertex = newDestinyVertex;
        this.updateDestinyPosition();
    }

    updateSourcePosition() {
        this.getElement().setAttribute("x1", this.sourceVertex.x.toString());
        this.getElement().setAttribute("y1", this.sourceVertex.y.toString());
    }

    updateDestinyPosition() {
        this.getElement().setAttribute("x2", this.destinyVertex.x.toString());
        this.getElement().setAttribute("y2", this.destinyVertex.y.toString());
    }

    setVertexTranslatedListener() {
        customEvents.listen("vertexTranslated", (vertexId) => {
            if(vertexId === this.sourceVertex.id)
                this.updateSourcePosition();
            if(vertexId === this.destinyVertex.id)
                this.updateDestinyPosition();
        });
    }

    buildElement() {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.setElementStyle();
        this.setElementListeners();

        customEvents.dispatch("prependChild", this.getElement());
    }

    setElementStyle() {
        this.getElement().classList.add("cursor-pointer");
    }

    setElementListeners() {
        this.getElement().oncontextmenu = (event) => event.preventDefault();
        this.getElement().onmouseup = () => customEvents.dispatch("clearOperation");

        this.getElement().onmousedown = (event) => {
            const clickCoordinate = [event.clientX, event.clientY];

            switch(event.button) {
                case MouseButton.LEFT:
                    return this.handleLeftButtonClick(clickCoordinate);
                case MouseButton.RIGHT:
                    return this.handleRightButtonClick(clickCoordinate);
            }
        }
    }

    handleLeftButtonClick(clickCoordinate) {
        customEvents.listenOnce("mouseRelativeCoordinate", (mouseCoordinate) => this.setTranslateReferenceCoordinates(mouseCoordinate));
        customEvents.dispatch("translateOperation", [this.id, clickCoordinate]);
    }

    setTranslateReferenceCoordinates(referenceCoordinate) {
        this.translateReferenceCoordinate = referenceCoordinate;
        this.sourceVertexReferenceCoordinate = this.sourceVertex.coordinate;
        this.destinyVertexReferenceCoordinate = this.destinyVertex.coordinate;
    }

    handleRightButtonClick(clickCoordinate) {
        customEvents.dispatch("splitEdge", [this.id, clickCoordinate]);
    }
}
