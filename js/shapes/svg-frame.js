class SvgFrame {

    static mount(targetElement) {
        return new SvgFrame(targetElement);
    }

    get vertexes() { return this._vertexes; }
    get edges() { return this._edges; }
    getSvgElement() { return this._svgElement; }

    constructor(targetElement) {
        this._vertexes = [];
        this._edges = [];
        this.buildSvgElement(targetElement);
        this.setupListeners();
    }

    setupListeners() {
        this.setClearOperationListener();
        this.setPrependChildListener();
        this.setAppendChildListener();
        this.setSplitEdgeListener();
        this.setDeleteVertexListener();
        this.setTranslateOperationListener();
        this.setMouseMoveListener();
    }

    setClearOperationListener() {
        customEvents.listen("clearOperation", () => this.operationSubjectId = 0);
    }

    setPrependChildListener() {
        customEvents.listen("prependChild", child => this.getSvgElement().prepend(child));
    }

    setAppendChildListener() {
        customEvents.listen("appendChild", child => this.getSvgElement().appendChild(child));
    }

    setSplitEdgeListener() {
        customEvents.listen("splitEdge", ([edgeId, clickCoordinates]) => {
            this.splitEdge(edgeId, this.getMouseRelativeCoordinate(clickCoordinates));
        });
    }

    splitEdge(edgeId, [newVertexX, newVertexY]) {
        const currentEdge = this.findEdgeById(edgeId);
        const newVertex = this.addVertex(newVertexX, newVertexY, currentEdge.sourceVertex);
        this.addEdge(newVertex, currentEdge.destinyVertex, currentEdge);
        currentEdge.setDestinyVertex(newVertex);
        // Dispatching `translateOperation` event will allow the user to
        // move the new vertex while holding the right mouse button down
        customEvents.dispatch("translateOperation", [newVertex.id]);
    }

    addVertex(vertexX, vertexY, previousVertex) {
        const vertexIndex = 1 + this.vertexes.indexOf(previousVertex);
        const vertex = new Vertex(vertexX, vertexY);
        this.vertexes.splice(vertexIndex, 0, vertex);

        return vertex;
    }

    addEdge(sourceVertex, destinyVertex, previousEdge) {
        const edgeIndex = 1 + this.edges.indexOf(previousEdge);
        const edge = new Edge(sourceVertex, destinyVertex);
        this.edges.splice(edgeIndex, 0, edge);

        return edge;
    }

    setDeleteVertexListener() {
        customEvents.listen("deleteVertex", ([vertexId]) => {
            this.deleteVertex(vertexId);
        });
    }

    deleteVertex(vertexId) {
        if(!this.isShape())
            return;

        const firstEdge = this.edges.find(edge => edge.destinyVertex.id === vertexId);
        const secondEdge = this.edges.find(edge => edge.sourceVertex.id === vertexId);
        firstEdge.setDestinyVertex(secondEdge.destinyVertex);

        this.removeVertexElement(vertexId);
        this.removeEdgeElement(secondEdge.id);
    }

    isShape() {
        return this.vertexes.length > 2;
    }

    removeVertexElement(vertexId) {
        const vertex = this.findVertexById(vertexId);
        this.vertexes.splice(this.vertexes.indexOf(vertex), 1);
        this.getSvgElement().removeChild(vertex.getElement());
    }

    removeEdgeElement(edgeId) {
        const edge = this.findEdgeById(edgeId);
        this.edges.splice(this.edges.indexOf(edge), 1);
        this.getSvgElement().removeChild(edge.getElement());
    }

    setTranslateOperationListener() {
        customEvents.listen("translateOperation", ([subjectId, clickCoordinates]) => {
            this.operationSubjectId = subjectId;

            if(clickCoordinates)
                customEvents.dispatch("mouseRelativeCoordinate", this.getMouseRelativeCoordinate(clickCoordinates));
        });
    }

    setMouseMoveListener() {
        this.getSvgElement().onmousemove = (event) => {
            if(!this.operationSubjectId || this.operationSubjectId <= 0)
                return;

            const [mouseX, mouseY] = this.getMouseRelativeCoordinateFromEvent(event);
            const operationComponent = this.findComponentById(this.operationSubjectId);
            operationComponent.translate(mouseX, mouseY);
        };
    }

    findComponentById(componentId) {
        return this.findVertexById(componentId) || this.findEdgeById(componentId);
    }

    findVertexById(vertexId) {
        return this.vertexes.find(vertex => vertex.id === vertexId);
    }

    findEdgeById(edgeId) {
        return this.edges.find(edge => edge.id === edgeId);
    }

    buildShape(sides = 2) {
        this.clearSvgElement();
        const { width, height } = this.getSvgElementBounding();
        const polygon = buildPolygon(sides, width, height);
        this.buildVertexes(polygon);
        this.buildEdgesFromVertexes();
    }

    buildVertexes(polygon) {
        this._vertexes = generatePolygonCoordinates(polygon).map(([x, y]) => new Vertex(x, y));
    }

    buildEdgesFromVertexes() {
        this._edges = this.vertexes.map((sourceVertex, i) => new Edge(sourceVertex, this.getNextVertex(i)));
    }

    getNextVertex(sourceVertexIndex) {
        const destinyIndex = (sourceVertexIndex + 1) % this.vertexes.length;
        return this.vertexes[destinyIndex];
    }

    getMouseRelativeCoordinateFromEvent(event) {
        const { clientX, clientY } = event;
        return this.getMouseRelativeCoordinate([clientX, clientY]);
    }

    getMouseRelativeCoordinate([mouseAbsoluteX, mouseAbsoluteY]) {
        const svgElementBounding = this.getSvgElementBounding();
        const mouseRelativeX = mouseAbsoluteX - svgElementBounding.left;
        const mouseRelativeY = mouseAbsoluteY - svgElementBounding.top;

        return [mouseRelativeX, mouseRelativeY];
    }

    getSvgElementBounding() {
        return this.getSvgElement().getBoundingClientRect();
    }

    clearSvgElement() {
        this.vertexes.map(vertex => vertex.id).map(vertexId => this.removeVertexElement(vertexId));
        this.edges.map(edge => edge.id).map(edgeId => this.removeEdgeElement(edgeId));
    }

    buildSvgElement(targetElement) {
        this._svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.setSvgElementStyle();
        this.getSvgElement().oncontextmenu = (e) => e.preventDefault();

        document.getElementById(targetElement)
            .appendChild(this.getSvgElement());
    }

    setSvgElementStyle() {
        this.getSvgElement().classList.add("w-full", "h-full");
        this.getSvgElement().setAttribute("fill", "#6b7280");
        this.getSvgElement().setAttribute("stroke", "#f9fafb");
        this.getSvgElement().setAttribute("stroke-width", "8");
        this.getSvgElement().setAttribute("stroke-linecap", "round");
        this.getSvgElement().setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }
}
