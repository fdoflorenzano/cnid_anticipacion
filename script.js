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
      nodes: null,
      links: null,
      questions: null,
      container: null,
      qcontainer: null,
      tooltip: null,
      tooltipped: null,
      questionClass: 'unactive',
      state: 'base',
      tooltipLarge: false,
      selected: null,
      simulation: null,
      heightScale: null,
      checkedFilters: [],
      dimensions: [],
      disciplines: [],
      tags: []
    }
  },
  computed: {
    width() {
      return this.WIDTH - this.MARGIN.RIGHT - this.MARGIN.LEFT;
    },
    height() {
      return this.HEIGHT - this.MARGIN.TOP - this.MARGIN.BOTTOM;
    },
  },
  mounted() {
    this.initialize();
    this.getData();
  },
  methods: {
    initialize() {
      this.scrollToEnd();
      this.container = d3.select('#container')
        .append('g')
        .attr('transform',
          `translate(${this.MARGIN.LEFT}, ${this.MARGIN.TOP})`);
      this.qcontainer = d3.select('#question_container')
        .append('g')
        .attr('transform',
          `translate(${this.MARGIN.LEFT}, ${this.MARGIN.TOP})`);
      this.tooltip = d3.select('.tooltip');
    },
    scrollToEnd() {
      let container = document.querySelector("html");
      const scrollHeight = container.scrollHeight;
      container.scrollTop = scrollHeight;
    },
    getData() {
      d3.json(this.FILEPATH, (error, data) => {
        if (error) throw error;
        this.nodes = data['nodes'];
        this.links = data['links'];
        this.questions = data['questions'];
        this.dimensions = data['dimensions'];
        this.disciplines = data['disciplines'];
        this.tags = data['tags'];

        this.heightScale = d3.scaleLinear()
          .range([this.height - 300, 100])
          .domain(d3.extent(this.nodes, d => d.date));

        this.setSimulation();
        this.setTimeline();

      });
    },
    setSimulation() {
      const dif = Math.abs(this.heightScale(5) - this.heightScale(0));
      this.simulation = d3.forceSimulation()
        .nodes(this.nodes)
        .force("colision", d3.forceCollide(this.RADIUS * 1.5))
        .force("charge", d3.forceManyBody().strength(-500))
        .force("link",
          d3.forceLink()
          .id(d => d.id)
          .distance(this.linkDistance(dif))
          .strength(0.25)
          .links(this.links))
        .force("vertical", d3.forceY(d => this.heightScale(d.date)).strength(0.3))
        .force("horizontal", d3.forceX(this.width / 2).strength(0.12))
        .on("tick", this.ticked);
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
    setTimeline() {
      let timelines = [2018, 2020];

      while (timelines[timelines.length - 1] < d3.max(this.nodes, d => d.date)) {
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
        .attr('y1', this.heightScale)
        .attr('y2', this.heightScale);
      this.container
        .selectAll('.timeline-text')
        .data(timelines)
        .enter()
        .append('text')
        .attr('class', 'timeline-text')
        .attr('x', 20)
        .attr('y', this.heightScale)
        .text(d => d);
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
    },
    toggleToolTip() {
      this.tooltipLarge = !this.tooltipLarge;
    }
  },
  watch: {
    nodes: function (val) {
      let that = this;

      const gNodes = this.container
        .selectAll('.node')
        .data(val)
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x}, ${d.y})`)
        .on("mouseover", function (d) {
          that.tooltipped = d;
          that.tooltip
            .style("left", (d3.event.pageX - 60) + "px")
            .style("top", (d3.event.pageY + 16) + "px");
        })
        .on('click', that.toggleToolTip);

      gNodes.append('circle')
        .attr('r', this.RADIUS);
    },
    links: function (val) {
      let that = this;

      this.container.selectAll('line')
        .data(val)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('x1', l => l.source.x)
        .attr('y1', l => l.source.y)
        .attr('x2', l => l.target.x)
        .attr('y2', l => l.target.y);
    },
    questions: function (val) {
      let that = this;

      const maxSquares = Math.floor(this.width / 30);
      this.QHEIGHT += 40 * (Math.floor(val.length / maxSquares))

      const squares = this.qcontainer
        .selectAll('.question')
        .data(val)
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
  }
});