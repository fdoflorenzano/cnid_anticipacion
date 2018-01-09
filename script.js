const vis = new Vue({
  el: "#vis",
  data() {
    return {
      title: "ANTICIPANDO HORIZONTES PARA CHILE",
      WIDTH: 1200,
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
      tooltip: null,
      simulation: null,
      heightScale: null,
    }
  },
  mounted() {
    console.log('mounting');
    this.scrollToEnd();
    this.tooltip = d3.select('.tooltip').style("opacity", 0);
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
        .on('dblclick', this.unfix)
        .on("mouseover", function (d) {
          d3.select('.tooltip').transition()
            .duration(200)
            .style("opacity", .9);
          console.log(d3.event);
          d3.select('.tooltip').html(tipHTML(d))
            .style("left", (d3.event.pageX - 60) + "px")
            .style("top", (d3.event.pageY + 16) + "px");
        })
        .on("mouseout", function (d) {
          d3.select('.tooltip').transition()
            .duration(500)
            .style("opacity", 0);
        });

      gNodes
        .append('circle')
        .attr('r', this.RADIUS);

      const squares = this.container.selectAll('.question')
        .data(val.squares)
        .enter()
        .append('rect')
        .attr('class', 'question')
        .attr()

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
        const squares = d3.range(20).map(_ => {
          text: 'lorem'
        });
        this.graph = {
          nodes,
          links,
          squares
        };

        const ranking = rankYears(nodes);

        heightScale = d3.scaleLinear()
          .range([this.height - 300, 100])
          .domain(d3.extent(nodes, d => d.fecha));

        const dif = Math.abs(heightScale(5) - heightScale(0));

        this.simulation = d3.forceSimulation()
          .nodes(this.graph.nodes)
          .force("colision", d3.forceCollide(this.RADIUS * 1.5))
          .force("charge", d3.forceManyBody().strength(-500))
          .force("link",
            d3.forceLink()
            .id(d => d.id)
            .distance(this.linkDistance(dif))
            .strength(0.25)
            .links(this.graph.links))
          .force("vertical", d3.forceY(d => heightScale(d.fecha)).strength(0.3))
          .force("horizontal", d3.forceX(this.width / 2).strength(0.12))
          .on("tick", this.ticked);

        const timelines = [2018, 2020];

        while (timelines[timelines.length - 1] < d3.max(nodes, d => d.fecha)) {
          timelines.push(timelines[timelines.length - 1] + 5);
        }

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
      console.log(d);
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
      d.x = Math.max(100, Math.min(this.width - 12, d.x));
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
    },
    linkDistance(dif) {
      return (l) => dif ? dif * Math.abs(l.source.fecha - l.target.fecha) / 5 : 40;
    },
    nodeCharge(ranking) {
      let max = -1;
      let min = 100000;
      for (let fecha in ranking) {
        if (max < ranking[fecha]) max = ranking[fecha]
        if (min > ranking[fecha]) min = ranking[fecha]
      }
      console.log(min, max)
      return d3.scaleLinear().domain([min, max]).range([-500, -125]);
    },
    scrollToEnd() {
      let container = document.querySelector("html");
      const scrollHeight = container.scrollHeight;
      container.scrollTop = scrollHeight;
    }
  }
});