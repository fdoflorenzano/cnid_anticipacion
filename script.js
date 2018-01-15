const vis = new Vue({
  el: "#vis",
  data() {
    return {
      WIDTH: 1200,
      HEIGHT: 6000,
      QHEIGHT: 140,
      MARGIN: {
        TOP: 50,
        BOTTOM: 50,
        LEFT: 0,
        RIGHT: 0
      },
      RADIUS: 10,
      FILEPATH: 'data/data.json',
      graph: null,
      container: null,
      qcontainer: null,
      tooltip: null,
      tooltipped: null,
      questionClass: 'unactive',
      toolTipType: false,
      state: 'base',
      selected: null,
      simulation: null,
      heightScale: null,
      checkedFilters: [],
      dimensions: [],
      disciplines: [],
      tags: []
    }
  },
  mounted() {
    console.log('mounting');
    this.scrollToEnd();
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
    toolTipType: function (val) {
      this.tooltip
        .classed('large', val)
        .html(val ? tipHTMLLong(this.tooltipped, this.tags) : tipHTML(this.tooltipped));
    },
    checkedFilters: function (val) {
      this.disableQuestionFilter();
      if (val.length > 0) {
        this.container
          .selectAll('.node')
          .classed('active', d => arrayContainsArray(d['tags'], this.checkedFilters))
          .classed('disable', d => !arrayContainsArray(d['tags'], this.checkedFilters));

        this.container
          .selectAll('.link')
          .classed('active', d => arrayContainsArray(d['tags'], this.checkedFilters))
          .classed('disable', d => !arrayContainsArray(d['tags'], this.checkedFilters));
      }
    },
    graph: function (val) {

      let that = this;

      this.container.selectAll('line')
        .data(val.links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('x1', l => l.source.x)
        .attr('y1', l => l.source.y)
        .attr('x2', l => l.target.x)
        .attr('y2', l => l.target.y);

      const gNodes = this.container
        .selectAll('.node')
        .data(val.nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x}, ${d.y})`)
        // .call(d3.drag()
        //   .on("start", this.dragstarted)
        //   .on("drag", this.dragged)
        //   .on("end", this.dragended))
        // .on('dblclick', this.unfix)
        .on("mouseover", function (d) {
          that.tooltipped = d;
          that.tooltip
            .style("opacity", .9);
          that.tooltip
            .classed('large', false)
            .html(tipHTML(d))
            .style("left", (d3.event.pageX - 60) + "px")
            .style("top", (d3.event.pageY + 16) + "px");
        })
        .on('click', function (d) {
          that.toolTipType = !that.toolTipType;
        });

      gNodes
        .append('circle')
        .attr('r', this.RADIUS);

      const maxSquares = Math.floor(this.width / 30);
      this.QHEIGHT += 40 * (Math.floor(val.squares.length / maxSquares))

      const squares = this.qcontainer
        .selectAll('.question')
        .data(val.squares)
        .enter()
        .append('rect')
        .attr('class', 'question')
        .attr('width', 20)
        .attr('height', 20)
        .attr('x', (_, i) => (i % maxSquares) * 30)
        .attr('y', (_, i) => 10 + 30 * (Math.floor(i / maxSquares)))
        .on("mouseover", function (d, i, el) {
          d3.select(el[i]).classed('hover', true);
          d3.select('.question_info').classed('active', true);
          d3.select('.question_info').select('.title').text(d.text);
          that.applyQuestionFilter(d);
        })
        .on("mouseout", function (d, i, el) {
          d3.select(el[i]).classed('hover', false);
          if (that.state == 'base') {
            d3.select('.question_info').classed('active', false);
            d3.select('.question_info').select('.title').text('');
            that.disableQuestionFilter();
          } else {
            d3.select('.question_info').classed('active', true);
            d3.select('.question_info').select('.title').text(that.selected.text);
            that.applyQuestionFilter(that.selected);
          }
        })
        .on("click", function (d, i, el) {
          d3.selectAll(el).classed('activated', false);
          d3.select(el[i]).classed('activated', that.state != d.id);
          if (that.state == d.id) {
            that.state = 'base';
            that.disableQuestionFilter();
          } else {
            that.state = d.id;
          }
          that.selected = that.state == d.id ? d : null;
        });

    }
  },
  methods: {
    getData() {
      console.log('about to read');
      d3.json(this.FILEPATH, (error, data) => {
        if (error) throw error;
        console.log('read');
        const nodes = data['nodes'];
        const links = data['links'];
        const squares = data['questions'];
        this.dimensions = data['dimensions'];
        this.disciplines = data['disciplines'];
        this.tags = data['tags'];
        this.graph = {
          nodes,
          links,
          squares
        };

        const ranking = rankYears(nodes);

        heightScale = d3.scaleLinear()
          .range([this.height - 300, 100])
          .domain(d3.extent(nodes, d => d.date));

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
          .force("vertical", d3.forceY(d => heightScale(d.date)).strength(0.3))
          .force("horizontal", d3.forceX(this.width / 2).strength(0.12))
          .on("tick", this.ticked);

        const timelines = [2018, 2020];

        while (timelines[timelines.length - 1] < d3.max(nodes, d => d.date)) {
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

        this.tooltip
          .on('click', function () {
            console.log('hi');
            that.toolTipType = !that.toolTipType;
          });

      });
    },
    initialize() {
      console.log('initializing');
      this.tooltip = d3.select('.tooltip').style("opacity", 0);
      this.container = d3.select('#container')
        .append('g')
        .attr('transform',
          `translate(${this.MARGIN.LEFT}, ${this.MARGIN.TOP})`);
      this.qcontainer = d3.select('#question_container')
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
      return (l) => dif ? dif * Math.abs(l.source.date - l.target.date) / 5 : 40;
    },
    scrollToEnd() {
      let container = document.querySelector("html");
      const scrollHeight = container.scrollHeight;
      container.scrollTop = scrollHeight;
    },
    applyQuestionFilter(question) {
      this.disableQuestionFilter();
      const id = question.id;
      this.container
        .selectAll('.node')
        .classed('active', d => d['question'].includes(id))
        .classed('disable', d => !d['question'].includes(id));

      this.container
        .selectAll('.link')
        .classed('active', d => d['questions'].includes(id))
        .classed('disable', d => !d['questions'].includes(id));

    },
    disableQuestionFilter() {
      this.container
        .selectAll('.node')
        .classed('active disable', false);
      this.container
        .selectAll('.link')
        .classed('active disable', false);
    }
  }
});