const vis = new Vue({
  el: "#vis",
  data: function () {
    return {
      WIDTH: 1200,
      MINIMAP_WIDTH: 200,
      QWIDTH: 800,
      HEIGHT: 6000,
      QHEIGHT: 40,
      MARGIN: {
        TOP: 0,
        BOTTOM: 0,
        LEFT: 60,
        RIGHT: 0
      },
      RADIUS: 5,
      FILEPATH: 'data/data.json',
      TRANSITION: null,
      nodes: null,
      links: null,
      questions: null,
      container: null,
      qcontainer: null,
      minimap: null,
      tooltip: null,
      tooltipped: null,
      tooltipLarge: false,
      selectedQuestion: null,
      simulation: null,
      heightScale: null,
      minimapHeightScale: null,
      minimapWidthScale: null,
      checkedFilters: [],
      collapsedFilters: [],
      dimensions: [],
      disciplines: [],
      tags: [],
      timelines: [],
      windowWidth: 0,
      windowHeight: 0,
      showChallenge: false,
      showDiscipline: false,
      showCategoryBoxes: false,
      triangle: null,
      dragging: false,
      maxSquares: 1
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
    this.getWindowWidth();
    this.getWindowHeight();
    this.$nextTick(function () {
      window.addEventListener('resize', this.getWindowWidth);
      window.addEventListener('resize', this.getWindowHeight);
      this.getWindowWidth();
      this.getWindowHeight();
      window.addEventListener('scroll', this.handleScroll);
    })
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
      this.container
        .append('circle')
        .attr('id', 'hover');
      this.container
        .append('rect')
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('fill', 'none')
        .on('click', this.removeTooltip);
      this.qcontainer = d3.select('#question_container')
        .append('g')
        .attr('transform',
          `translate(${this.MARGIN.LEFT}, ${this.MARGIN.TOP})`);
      this.tooltip = d3.select('.tooltip');

      this.minimapHeightScale = d3.scaleLinear()
        .domain([0, this.HEIGHT])
        .range([0, this.windowHeight])
        .clamp(true);
      this.minimapWidthScale = d3.scaleLinear()
        .domain([0, this.width])
        .range([0, this.MINIMAP_WIDTH])
        .clamp(true);

      this.minimap = d3.select('#minimap');
      this.minimap.append('g').attr('class', 'links');

      this.minimap
        .selectAll('.rect-container')
        .data([{
          x: 0,
          y: 0
        }])
        .enter()
        .append('g')
        .attr('class', 'rect-container')
        .append('rect')
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('width', this.MINIMAP_WIDTH)
        .attr('height', this.minimapHeightScale(this.windowHeight))
        .attr('fill', 'grey')
        .attr('opacity', 0.2);

      this.TRANSITION = d3.transition()
        .duration(100)
        .ease(d3.easeLinear);
    },
    scrollToEnd() {
      let container = document.querySelector("html");
      const scrollHeight = container.scrollHeight;
      container.scrollTop = scrollHeight;
    },
    getWindowWidth(event) {
      this.windowWidth = document.documentElement.clientWidth;
    },
    getWindowHeight(event) {
      this.windowHeight = document.documentElement.clientHeight;
    },
    handleScroll(event) {
      this.showCategoryBoxes = window.scrollY <= 6000;
      if (this.showCategoryBoxes && !this.dragging) {
        this.minimap.select('rect')
          .attr('y', d => d.y = this.minimapHeightScale(window.scrollY));
      }
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
        .force("charge", d3.forceManyBody().strength(-this.width / 1200 * 500))
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
      this.minimap.selectAll('circle')
        .attr('cx', d => this.minimapWidthScale(d.x))
        .attr('cy', d => this.minimapHeightScale(d.y));
      this.container.selectAll('.link')
        .attr('x1', l => l.source.x)
        .attr('y1', l => l.source.y)
        .attr('x2', l => l.target.x)
        .attr('y2', l => l.target.y);
      this.minimap.selectAll('.link')
        .attr('x1', l => this.minimapWidthScale(l.source.x))
        .attr('y1', l => this.minimapHeightScale(l.source.y))
        .attr('x2', l => this.minimapWidthScale(l.target.x))
        .attr('y2', l => this.minimapHeightScale(l.target.y));
    },
    linkDistance(dif) {
      return (l) => dif ? dif * Math.abs(l.source.date - l.target.date) / 5 : 40;
    },
    setTimeline() {
      let timelines = [2018, 2020];

      while (timelines[timelines.length - 1] < d3.max(this.nodes, d => d.date)) {
        timelines.push(timelines[timelines.length - 1] + 10);
      }

      let that = this;

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
        .attr('y', d => this.heightScale(d) + 8)
        .text(d => d);
      this.minimap
        .append('g')
        .attr('class', 'timelines')
        .selectAll('.timeline')
        .data(timelines)
        .enter()
        .append('line')
        .attr('class', 'timeline')
        .attr('x1', 0)
        .attr('x2', this.MINIMAP_WIDTH)
        .attr('y1', d => this.minimapHeightScale(this.heightScale(d)))
        .attr('y2', d => this.minimapHeightScale(this.heightScale(d)));
      this.minimap
        .selectAll('.timeline-text')
        .data(timelines)
        .enter()
        .append('text')
        .attr('class', 'timeline-text')
        .attr('x', 5)
        .attr('y', d => this.minimapHeightScale(this.heightScale(d)) + 12)
        .text(d => d);

      this.minimap.on('click', function () {
        d3.select(this)
          .select('rect')
          .attr('y', d => d.y = d3.event.y - that.minimapHeightScale(that.windowHeight) / 2);
        let container = document.querySelector("html");
        const scrollHeight = container.scrollHeight;
        container.scrollTop = that.minimapHeightScale.invert((d3.event.y - that.minimapHeightScale(that.windowHeight) / 2));
      });
      this.minimap
        .select('.rect-container')
        .call(d3.drag()
          .on("start", () => that.dragging = true)
          .on("drag", function () {
            d3.select(this)
              .select('rect')
              .attr('y', d => d.y = d3.event.y);
            let container = document.querySelector("html");
            const scrollHeight = container.scrollHeight;
            container.scrollTop = that.minimapHeightScale.invert(d3.event.y);
          })
          .on("end", () => that.dragging = false)
        );

      this.timelines = timelines;
    },
    applyFilters(select = false, question = null, index = -1, elements = null) {
      if (!select && question != null) {
        d3.select(elements[index]).classed('hover', true);
        this.triangle.transition().ease(d3.easeCubic).delay(20).duration(180).attr('opacity', 1);
        this.triangle.attr('transform', `translate(${10 + (index % this.maxSquares) * 30} 0)`);
        d3.select('.question-info').classed('active', true);
        d3.select('.question-info').select('.title').text(question.text);
        this.applyQuestionFilter(question);
      } else if (select) {
        d3.selectAll(elements).classed('activated', false);
        if (this.selectedQuestion != null && this.selectedQuestion.id == question.id) {
          this.selectedQuestion = null;
          d3.select(elements[index]).classed('activated', false);
          this.applyQuestionFilter();
        } else {
          this.selectedQuestion = question;
          d3.select(elements[index]).classed('activated', true);
        }
      } else if (!select) {
        if (elements != null) d3.select(elements[index]).classed('hover', false);
        if (this.selectedQuestion == null) {
          d3.select('.question-info').classed('active', false);
          d3.select('.question-info').select('.title').text('');
          this.triangle.transition().duration(200).attr('opacity', 0);
          this.applyQuestionFilter();
        } else {
          d3.select('.question-info').classed('active', true);
          d3.select('.question-info').select('.title').text(this.selectedQuestion.text);
          this.triangle.attr('opacity', 1)
            .attr('transform', `translate(${10 + (this.selectedQuestion.index % this.maxSquares) * 30} 0)`);
          this.applyQuestionFilter(this.selectedQuestion);
        }
      }

    },
    applyQuestionFilter(question = null) {
      this.container
        .selectAll('.node')
        .attr('class', this.filterCondition('node', question))

      this.minimap
        .selectAll('.node')
        .attr('class', this.filterCondition('node', question))
        .transition()
        .duration(500)
        .ease(d3.easeCubic)
        .attr('fill', (d, i, el) => {
          const c = d3.select(el[i]).attr('class');
          switch (c) {
            case 'node active':
              return '#e52331';
            default:
              return '#f2f2f2';
          }
        })
        .attr('r', (d, i, el) => {
          const c = d3.select(el[i]).attr('class');
          switch (c) {
            case 'node active':
              return '2';
            default:
              return '1';
          }
        })
        .attr('opacity', (d, i, el) => {
          const c = d3.select(el[i]).attr('class');
          switch (c) {
            case 'node disable':
              return '0';
            default:
              return '1';
          }
        });

      this.container
        .selectAll('.link')
        .attr('class', this.filterCondition('link', question));

      this.minimap
        .selectAll('.link')
        .attr('class', this.filterCondition('link', question))
        .transition()
        .duration(500)
        .ease(d3.easeCubic)
        .attr('stroke', (d, i, el) => {
          const c = d3.select(el[i]).attr('class');
          switch (c) {
            case 'link active':
              return '#e52331';
            default:
              return '#f2f2f2';
          }
        })
        .attr('stroke-width', (d, i, el) => {
          const c = d3.select(el[i]).attr('class');
          switch (c) {
            case 'link active':
              return '1';
            default:
              return '0.5';
          }
        })
        .attr('opacity', (d, i, el) => {
          const c = d3.select(el[i]).attr('class');
          switch (c) {
            case 'link disable':
              return '0';
            default:
              return '1';
          }
        });

    },
    filterCondition(mainType, question = null) {
      if (question == null & this.checkedFilters.length == 0) {
        return `${mainType}`;
      } else if (question == null) {
        return d => arrayContainsArray(d['tags'], this.checkedFilters) ? `${mainType} active` : `${mainType} disable`;
      } else if (this.checkedFilters.length == 0) {
        return d => d['question'].includes(question.id) ? `${mainType} active` : `${mainType} disable`;
      } else {
        return d => d['question'].includes(question.id) && arrayContainsArray(d['tags'], this.checkedFilters) ? `${mainType} active` : `${mainType} disable`;
      }
    },
    filterConditionDisable(question = null) {
      if (question == null & this.checkedFilters.length == 0) {
        return false;
      } else if (question == null) {
        return d => !arrayContainsArray(d['tags'], this.checkedFilters);
      } else if (this.checkedFilters.length == 0) {
        return d => !d['question'].includes(question.id);
      } else {
        return d => !(d['question'].includes(question.id) && arrayContainsArray(d['tags'], this.checkedFilters));
      }
    },
    toggleToolTip() {
      this.tooltipLarge = !this.tooltipLarge;
    },
    toggleChallenge() {
      this.showChallenge = !this.showChallenge;
    },
    toggleDiscipline() {
      this.showDiscipline = !this.showDiscipline;
    },
    removeTooltip() {
      this.tooltipped = null;
    },
    addFilterTag(tag) {
      const index = this.checkedFilters.indexOf(tag);
      if (index < 0) {
        this.checkedFilters = [...this.checkedFilters, tag];
      } else {
        this.checkedFilters.splice(index, 1);
      }
    },
    collapse(id) {
      const index = this.collapsedFilters.indexOf(id);
      if (index < 0) {
        this.collapsedFilters = [...this.collapsedFilters, id];
      } else {
        this.collapsedFilters.splice(index, 1);
      }
    },
    resize() {
      if (this.simulation) {
        this.simulation.force("horizontal")
          .x(this.width / 2);
        this.simulation.force("charge").strength(-this.width / 1200 * 500);
        this.simulation.alphaTarget(0.3).restart();
      }
      this.container
        .selectAll('.timeline')
        .data(this.timelines)
        .attr('x1', 100)
        .attr('x2', this.width)
        .attr('y1', this.heightScale)
        .attr('y2', this.heightScale);
      if (this.MINIMAP_WIDTH && this.heightScale) {
        this.resizeMinimap();
      }
      if (this.questions) {
        this.maxSquares = Math.floor(this.width / 30);
        this.QHEIGHT += 40 * (Math.floor(this.questions.length / this.maxSquares));

        const squares = this.qcontainer
          .selectAll('.question')
          .data(this.questions)
          .attr('x', (_, i) => 10 + (i % this.maxSquares) * 30)
          .attr('y', (_, i) => 10 + 30 * (Math.floor(i / this.maxSquares)));
      }

    },
    resizeMinimap() {
      let that = this;
      this.minimap
        .selectAll('.timeline')
        .attr('x1', 0)
        .attr('x2', this.MINIMAP_WIDTH)
        .attr('y1', d => this.minimapHeightScale(this.heightScale(d)))
        .attr('y2', d => this.minimapHeightScale(this.heightScale(d)));
      this.minimap
        .selectAll('.timeline-text')
        .attr('y', d => this.minimapHeightScale(this.heightScale(d)) + 16);
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
        .on('mouseenter', function (d) {
          console.log(d3.event);
          that.container.select('#hover')
            .attr('cx', d.x)
            .attr('cy', d.y)
            .attr('r', that.RADIUS + 4)
            .transition()
            .duration(200)
            .attr('r', that.RADIUS + 10);
        })
        .on('mouseleave', function () {
          that.container.select('#hover')
            .transition()
            .duration(200)
            .attr('r', 0);
        })
        .on("mouseover", function (d, i, el) {
          that.tooltipped = null;
          that.tooltip
            .style("left", (d3.event.pageX - 60) + "px")
            .style("top", (d3.event.pageY + 16) + "px");
          that.tooltipped = d;
        })
        .on('click', that.toggleToolTip);

      gNodes.append('circle')
        .attr('r', this.RADIUS);

      this.minimap
        .selectAll('.node')
        .data(val)
        .enter()
        .append('circle')
        .attr('class', 'node')
        .attr('cx', d => this.minimapWidthScale(d.x))
        .attr('cy', d => this.minimapHeightScale(d.y))
        .attr('fill', 'white')
        .attr('r', 1);
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

      this.minimap
        .select('.links')
        .selectAll('.link')
        .data(val)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('x1', l => this.minimapWidthScale(l.source.x))
        .attr('y1', l => this.minimapHeightScale(l.source.y))
        .attr('x2', l => this.minimapWidthScale(l.target.x))
        .attr('y2', l => this.minimapHeightScale(l.target.y))
        .attr('stroke', '#f2f2f2')
        .attr('stroke-width', '0.5');
    },
    questions: function (val) {
      let that = this;

      val.forEach((v, i) => {
        v['index'] = i;
      });

      this.maxSquares = Math.floor(this.width / 30);
      this.QHEIGHT += 40 * (Math.floor(val.length / this.maxSquares));

      this.triangle = this.qcontainer
        .append('path')
        .attr('class', 'triangle')
        .attr('d', 'M0 0 L20 0 L 10 14.422 Z')
        .attr('opacity', 0);

      const squares = this.qcontainer
        .selectAll('.question')
        .data(val)
        .enter()
        .append('rect')
        .attr('class', 'question')
        .attr('width', 20)
        .attr('height', 20)
        .attr('x', (_, i) => 10 + (i % this.maxSquares) * 30)
        .attr('y', (_, i) => 20 + 30 * (Math.floor(i / this.maxSquares)))
        .on("mouseover", (d, i, el) => that.applyFilters(false, d, i, el))
        .on("mouseout", (d, i, el) => that.applyFilters(false, null, i, el))
        .on("click", (d, i, el) => that.applyFilters(true, d, i, el));
    },
    checkedFilters: function (val) {
      this.applyFilters();
    },
    windowWidth: function (val) {
      this.WIDTH = val > 1200 ? 1200 : val;
      this.MINIMAP_WIDTH = val > 1200 ? 200 : 0;
      this.resize();
    },
    windowHeight: function (val) {
      this.minimapHeightScale.range([0, this.windowHeight]);
      this.resize();
    }
  }
});