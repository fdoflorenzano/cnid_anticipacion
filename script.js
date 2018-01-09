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
      RADIUS: 10,
      FILEPATH: 'datos.csv',
      graph: null,
      container: null,
      simulation: null,
      heightScale: null,
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
        .attr('class', 'link')
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
        .attr('r', this.RADIUS);

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

        heightScale = d3.scaleLinear()
          .range([this.height - 300, 100])
          .domain(d3.extent(nodes, d => d.fecha));

        this.simulation = d3.forceSimulation()
          .nodes(this.graph.nodes)
          .force("colision", d3.forceCollide(this.RADIUS * 1.5))
          .force("charge", d3.forceManyBody().strength(-150))
          .force("link", d3.forceLink().id(d => d.id).strength(0.05).links(this.graph.links))
          .force("vertical", d3.forceY(d => heightScale(d.fecha)))
          .force("horizontal", d3.forceX(this.width/2).strength(0.05))
          .on("tick", this.ticked);

        const timelines = [2018, 2020];

        while (timelines[timelines.length - 1] < d3.max(nodes, d => d.fecha)) {
          timelines.push(timelines[timelines.length - 1] + 5);
        }
        console.log(timelines);

        this.container
          .selectAll('.timeline')
          .data(timelines)
          .enter()
          .append('line')
          .attr('class', 'timeline')
          .attr('x1', 100)
          .attr('x2', this.width)
          .attr('y1', heightScale)
          .attr('y2', heightScale);
        this.container
          .selectAll('.timeline-text')
          .data(timelines)
          .enter()
          .append('text')
          .attr('class', 'timeline-text')
          .attr('x', 20)
          .attr('y', heightScale)
          .text(d => d);

      });
    },
    initialize() {
      console.log('initializing');
      this.container = d3.select('#container')
        .append('g')
        .attr('transform',
          `translate(${this.MARGIN.LEFT}, ${this.MARGIN.TOP})`);

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
      this.container.selectAll('.link')
        .attr('x1', l => l.source.x)
        .attr('y1', l => l.source.y)
        .attr('x2', l => l.target.x)
        .attr('y2', l => l.target.y);
    }
  }
});