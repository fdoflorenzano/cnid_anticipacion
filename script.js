const vis = new Vue({
  el: "#vis",
  data() {
    return {
      title: "ANTICIPANDO HORIZONTES PARA CHILE",
      WIDTH: 1000,
      HEIGHT: 6000,
      MARGIN: {
        TOP: 50,
        BOTTOM: 50,
        LEFT: 0,
        RIGHT: 0
      },
      FILEPATH: 'datos.csv',
      graph: null,
      container: null,
      simulation: null
    }
  },
  mounted() {
    console.log('mounting');
    this.initialize();
    this.getData();
  },
  computed: {
    width() {
      return this.WIDTH - this.MARGIN.RIGHT - this.MARGIN.LEFT;
    },
    height() {
      return this.HEIGHT - this.MARGIN.TOP - this.MARGIN.BOTTOM;
    },
  },
  watch: {
    graph: function (val) {

      this.container.selectAll('line')
        .data(val.links)
        .enter()
        .append('line')
        .attr('x1', l => l.source.x)
        .attr('y1', l => l.source.y)
        .attr('x2', l => l.target.x)
        .attr('y2', l => l.target.y);

      const gNodes = this.container.selectAll('.node')
        .data(val.nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x}, ${d.y})`)
        .call(d3.drag()
          .on("start", this.dragstarted)
          .on("drag", this.dragged)
          .on("end", this.dragended))
        .on('dblclick', this.unfix);

      gNodes
        .append('circle')
        .attr('r', 10);

      gNodes
        .append('text')
        .attr("dy", 5)
        .text(d => d.id);

      gNodes
        .append('title')
        .text(d => d.name);
    }
  },
  methods: {
    getData() {
      console.log('about to read');
      d3.csv(this.FILEPATH, (error, data) => {
        if (error) throw error;
        console.log('read');
        const nodes = data.map(nodificador);
        const links = linkeador(data);
        this.graph = {
          nodes,
          links
        };

        // this.simulation
        //   .force("link")
        //   .links(this.graph.links);

        this.simulation.nodes(this.graph.nodes).on("tick", this.ticked);

      });
    },
    initialize() {
      console.log('initializing');
      this.container = d3.select('#container')
        .append('g')
        .attr('transform',
          `translate(${this.MARGIN.LEFT}, ${this.MARGIN.TOP})`);

      this.simulation = d3.forceSimulation()
        .force("colision", d3.forceCollide(50))
        .force("charge", d3.forceManyBody().strength(-20))
        .force("link", d3.forceLink().id(l => l.id).distance(5).strength(0.1));
      console.log('initialized');
    },
    dragstarted(d, i, elements) {
      if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
      d3.select(elements[i]).classed("active", true);
      d3.select(elements[i]).classed("fixed", true);
    },
    dragged(d, i, elements) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    },
    dragended(d, i, elements) {
      d3.select(elements[i]).classed("active", false);
      if (!d3.event.active) this.simulation.alphaTarget(0);
    },
    unfix(d, i, elements) {
      d3.select(elements[i]).classed("fixed", false);
      d.fx = null;
      d.fy = null;
    },
    boundedX(d) {
      d.x = Math.max(10, Math.min(this.width - 10, d.x));
      return d.x;
    },
    boundedY(d) {
      d.y = Math.max(10, Math.min(this.height - 10, d.y));
      return d.y;
    },
    ticked() {
      this.container.selectAll('.node')
        .attr('transform', d => `translate(${this.boundedX(d)}, ${this.boundedY(d)})`);
      this.container.selectAll('line')
        .attr('x1', l => l.source.x)
        .attr('y1', l => l.source.y)
        .attr('x2', l => l.target.x)
        .attr('y2', l => l.target.y);
    }
  }
});