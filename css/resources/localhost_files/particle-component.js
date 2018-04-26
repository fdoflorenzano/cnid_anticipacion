Vue.component('particle', {
    template: '<svg id="particles" :width="width" :height="height"></svg>',
    props: ['width', 'height'],
    data: function () {
        return {
            container: null,
            particles: [],
            links: [],
            simulation: null
        }
    },
    mounted() {
        this.container = d3.select('#particles');

        this.particles = d3.range(30).map((p, i) => ({
            id: i
        }));

        this.links = d3.range(20).map((l, i) => ({
            source: Math.floor(30 * Math.random()),
            target: Math.floor(30 * Math.random()),
        }));

        this.simulation = d3.forceSimulation()
            .nodes(this.particles)
            .force("link",
                d3.forceLink()
                .id(d => d.id)
                .strength(0)
                .links(this.links))
            .force("random", this.randomForce)
            .on("tick", this.ticked)
            .alphaTarget(0.3);


        this.container
            .selectAll('line')
            .data(this.links)
            .enter()
            .append('line')
            .attr('class', "st2")
            .attr('x1', d => d.source.x)
            .attr('x2', d => d.target.x)
            .attr('y1', d => d.source.y)
            .attr('y2', d => d.target.y)
            .attr('opacity', 0.3);

        this.container
            .selectAll('circle')
            .data(this.particles)
            .enter()
            .append('circle')
            .attr('class', d => d.class)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 7)
            .attr('opacity', 0.3);

    },
    watch: {
        width: function (val) {
            this.resize();
        },
        height: function (val) {
            this.resize();
        }
    },
    methods: {
        resize() {

        },
        boundedX(d) {
            if (this.width < d.x) {
                d.x = this.width;
                d.vx = -d.vx;
                d.velbase.x = -d.velbase.x;
            } else if (d.x < 0) {
                d.x = 0;
                d.vx = -d.vx;
                d.velbase.x = -d.velbase.x;
            }
            return d.x;
        },
        boundedY(d) {
            if (this.height < d.y) {
                d.y = this.height;
                d.vy = -d.vy;
                d.velbase.y = -d.velbase.y;
            } else if (d.y < 0) {
                d.y = 0;
                d.vy = -d.vy;
                d.velbase.y = -d.velbase.y;
            }
            return d.y;
        },
        ticked() {
            this.container.selectAll('circle')
                .attr('cx', d => this.boundedX(d))
                .attr('cy', d => this.boundedY(d));
            this.container.selectAll('line')
                .attr('x1', l => l.source.x)
                .attr('y1', l => l.source.y)
                .attr('x2', l => l.target.x)
                .attr('y2', l => l.target.y)
                .attr('stroke-width', this.distanceCondition);
        },
        distanceCondition(link) {
            const distance = Math.abs(link.source.x - link.target.x) +
                Math.abs(link.source.y - link.target.y);

            return distance > 500 ? 0 : 0.75;
        },
        randomForce(alpha) {
            this.particles.forEach(p => {
                if (!p.velbase) {
                    p.velbase = {
                        x: (Math.floor(Math.random() * 5) - 2) / 4,
                        y: (Math.floor(Math.random() * 5) - 2) / 4,
                    }
                }
                p.velbase.x = Math.max(-1, Math.min(p.velbase.x + (Math.random() - 0.5) / 5, 1));
                p.velbase.y = Math.max(-1, Math.min(p.velbase.y + (Math.random() - 0.5) / 5, 1));
                p.vx = p.vx ? p.velbase.x : p.velbase.x + Math.random() - 0.5;
                p.vy = p.vy ? p.velbase.y : p.velbase.y + Math.random() - 0.5;
            })
        }
    }
});