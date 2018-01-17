const title = {
    template: '<svg id="title_particle" :width="width" :height="height"></svg>',
    props: ['width'],
    data: function () {
        return {
            container: null,
            paths: [{
                    class: "st0",
                    d: "M160.3,227.9h20.2c11.2,0,20.8,4.2,20.8,17.3c0,12.7-9.9,18.2-20.8,18.2h-6.4v16.5h-13.8V227.9z M179.8,252.6 c5.4,0,8-2.7,8-7.4c0-4.6-2.9-6.4-8-6.4h-5.8v13.8H179.8z"
                },
                {
                    class: "st0",
                    d: "M230.4,268.9h-14.6l-2.6,11h-14.1l15.8-52h16.6l15.8,52H233L230.4,268.9z M227.9,258.2l-0.9-3.6 c-1.3-5-2.6-11.3-3.8-16.5h-0.3c-1.1,5.3-2.4,11.5-3.7,16.5l-0.9,3.6H227.9z"
                },
                {
                    class: "st0",
                    d: "M280.5,279.9l-9-17.4h-5.3v17.4h-13.8v-52h19.7c11.2,0,20.8,3.8,20.8,16.8c0,7.4-3.4,12.3-8.4,15l11.3,20.2 H280.5z M266.2,251.6h5c5.4,0,8.3-2.4,8.3-6.9s-2.9-5.9-8.3-5.9h-5V251.6z"
                },
                {
                    class: "st0",
                    d: "M326.7,268.9h-14.6l-2.6,11h-14.1l15.8-52H328l15.8,52h-14.6L326.7,268.9z M324.2,258.2l-0.9-3.6 c-1.3-5-2.6-11.3-3.8-16.5h-0.3c-1.1,5.3-2.4,11.5-3.7,16.5l-0.9,3.6H324.2z"
                },
                {
                    class: "st0",
                    d: "M388.8,227c6.6,0,12.2,3.2,15.8,6.9l-7.5,8.5c-2.6-2.2-4.8-3.5-8.2-3.5c-6.2,0-11.5,5.6-11.5,15 c0,9.8,4.5,15.2,11.2,15.2c4,0,6.9-1.8,9.1-4.2l7.5,8.3c-4.4,5.1-10.4,7.7-16.8,7.7c-13.6,0-25.1-8.8-25.1-26.6 C363.4,236.9,375.4,227,388.8,227z"
                },
                {
                    class: "st0",
                    d: "M412.5,227.9h13.8v19.4h15.5v-19.4h13.8v52h-13.8v-20.6h-15.5v20.6h-13.8V227.9z"
                },
                {
                    class: "st0",
                    d: "M467,227.9h13.8v52H467V227.9z"
                },
                {
                    class: "st0",
                    d: "M492.3,227.9h13.8v40.5h19.7v11.5h-33.4V227.9z"
                },
                {
                    class: "st0",
                    d: "M534.7,227.9h33.6v11.5h-19.8v8.2h17v11.5h-17v9.3h20.6v11.5h-34.4V227.9z"
                },
                {
                    class: "st1",
                    d: "M80.8,58.3H61.5l-3.4,14.6H39.5L60.5,4h22.1l21,68.9H84.2L80.8,58.3z M77.6,44.2l-1.2-4.8 c-1.7-6.6-3.4-15-5.1-21.8h-0.4c-1.5,7-3.2,15.3-4.9,21.8l-1.2,4.8H77.6z"
                },
                {
                    class: "st1",
                    d: "M110.1,4h18.7L144,34.7l6.6,15.5h0.4c-0.8-7.4-2.3-17.8-2.3-26.3V4h17.4v68.9h-18.7L132.2,42l-6.6-15.4h-0.4 c0.8,7.8,2.3,17.8,2.3,26.3v19.9h-17.4V4z"
                },
                {
                    class: "st1",
                    d: "M194.5,19.3h-18.2V4H231v15.3h-18.2v53.7h-18.2V19.3z"
                },
                {
                    class: "st1",
                    d: "M241.2,4h18.2v68.9h-18.2V4z"
                },
                {
                    class: "st1",
                    d: "M305.4,2.7c8.7,0,16.1,4.2,21,9.1l-10,11.2c-3.4-3-6.4-4.7-10.8-4.7c-8.3,0-15.3,7.4-15.3,19.9 c0,12.9,5.9,20.1,14.8,20.1c5.3,0,9.1-2.3,12.1-5.5l10,11c-5.8,6.8-13.8,10.2-22.3,10.2c-18,0-33.3-11.7-33.3-35.2 C271.7,15.9,287.6,2.7,305.4,2.7z"
                },
                {
                    class: "st1",
                    d: "M336.8,4h18.2v68.9h-18.2V4z"
                },
                {
                    class: "st1",
                    d: "M370.3,4h26.7c14.8,0,27.6,5.5,27.6,22.9c0,16.9-13.1,24.2-27.6,24.2h-8.5v21.8h-18.2V4z M396.2,36.6 c7.2,0,10.6-3.6,10.6-9.8s-3.8-8.5-10.6-8.5h-7.6v18.2H396.2z"
                },
                {
                    class: "st1",
                    d: "M463.2,58.3h-19.3l-3.4,14.6h-18.7l21-68.9h22.1l21,68.9h-19.3L463.2,58.3z M459.9,44.2l-1.2-4.8 c-1.7-6.6-3.4-15-5.1-21.8h-0.4c-1.5,7-3.2,15.3-4.9,21.8l-1.2,4.8H459.9z"
                },
                {
                    class: "st1",
                    d: "M492.5,4h18.7l15.3,30.8l6.6,15.5h0.4c-0.8-7.4-2.3-17.8-2.3-26.3V4h17.4v68.9h-18.7L514.5,42L508,26.7h-0.4c0.8,7.8,2.3,17.8,2.3,26.3v19.9h-17.4V4z"
                },
                {
                    class: "st1",
                    d: "M563.8,4h20.4c21,0,35.4,9.8,35.4,34.1s-14.4,34.8-34.4,34.8h-21.4V4z M583.1,58.3c10,0,17.8-4,17.8-20.1 c0-16.1-7.8-19.5-17.8-19.5H582v39.7H583.1z"
                },
                {
                    class: "st1",
                    d: "M628.9,38.1c0-22.7,12.9-35.4,32-35.4s32,12.8,32,35.4c0,22.7-12.9,36.1-32,36.1S628.9,60.8,628.9,38.1z M674.2,38.1c0-12.5-5.1-19.7-13.4-19.7s-13.4,7.2-13.4,19.7c0,12.5,5.1,20.4,13.4,20.4S674.2,50.6,674.2,38.1z"
                },
                {
                    class: "st1",
                    d: "M61.3,118h18.2v25.7h20.6V118h18.2v68.9h-18.2v-27.4H79.6v27.4H61.3V118z"
                },
                {
                    class: "st1",
                    d: "M130.7,152.1c0-22.7,12.9-35.4,32-35.4s32,12.8,32,35.4c0,22.7-12.9,36.1-32,36.1S130.7,174.8,130.7,152.1z M176.1,152.1c0-12.5-5.1-19.7-13.4-19.7s-13.4,7.2-13.4,19.7c0,12.5,5.1,20.4,13.4,20.4S176.1,164.6,176.1,152.1z"
                },
                {
                    class: "st1",
                    d: "M244.2,186.9l-11.9-23.1h-7v23.1H207V118h26.1c14.8,0,27.6,5.1,27.6,22.3c0,9.9-4.5,16.3-11.1,19.9l15,26.7 H244.2z M225.3,149.4h6.6c7.2,0,11-3.2,11-9.1c0-5.9-3.8-7.8-11-7.8h-6.6V149.4z"
                },
                {
                    class: "st1",
                    d: "M273.8,118h18.2v68.9h-18.2V118z"
                },
                {
                    class: "st1",
                    d: "M303.1,175.9l28.2-42.6h-25.4V118h47.9v11l-28.2,42.6H354v15.3h-50.9V175.9z"
                },
                {
                    class: "st1",
                    d: "M359.7,152.1c0-22.7,12.9-35.4,32-35.4s32,12.8,32,35.4c0,22.7-12.9,36.1-32,36.1S359.7,174.8,359.7,152.1z M405.1,152.1c0-12.5-5.1-19.7-13.4-19.7s-13.4,7.2-13.4,19.7c0,12.5,5.1,20.4,13.4,20.4S405.1,164.6,405.1,152.1z"
                },
                {
                    class: "st1",
                    d: "M436.1,118h18.7l15.3,30.8l6.6,15.5h0.4c-0.8-7.4-2.3-17.8-2.3-26.3V118h17.4v68.9h-18.7L458.1,156l-6.6-15.4 h-0.4c0.8,7.8,2.3,17.8,2.3,26.3v19.9h-17.4V118z"
                },
                {
                    class: "st1",
                    d: "M520.5,133.2h-18.2V118H557v15.3h-18.2v53.7h-18.2V133.2z"
                },
                {
                    class: "st1",
                    d: "M567.2,118h44.5v15.3h-26.3v10.8h22.5v15.3h-22.5v12.3h27.4v15.3h-45.6V118z"
                },
                {
                    class: "st1",
                    d: "M632.3,165.8c4.9,3.9,11,6.7,16.1,6.7c5.5,0,7.8-1.8,7.8-4.9c0-3.3-3.5-4.3-9.3-6.7l-8.6-3.6 c-7.4-3-13.9-9.2-13.9-19.2c0-11.8,10.6-21.4,25.7-21.4c7.8,0,16.5,3,22.9,9.2l-9.1,11.5c-4.7-3.3-8.7-5-13.8-5 c-4.5,0-7.2,1.6-7.2,4.7c0,3.3,3.9,4.5,10.2,6.9l8.4,3.3c8.6,3.4,13.5,9.3,13.5,18.9c0,11.7-9.8,22.1-26.9,22.1 c-8.7,0-18.7-3.2-26.1-9.9L632.3,165.8z"
                },
            ],
            particles: [{
                    class: "st0",
                    x: 211.5,
                    y: 72.9,
                    r: "4.5",
                    id: "1"
                },
                {
                    class: "st0",
                    x: 327.5,
                    y: 11.9,
                    r: "4.5",
                    id: "2"
                },
                {
                    class: "st0",
                    x: 461.5,
                    y: 58.9,
                    r: "4.5",
                    id: "3"
                },
                {
                    class: "st0",
                    x: 534.5,
                    y: 49.9,
                    r: "4.5",
                    id: "4"
                },
                {
                    class: "st0",
                    x: 665.5,
                    y: 20.9,
                    r: "4.5",
                    id: "5"
                },
                {
                    class: "st0",
                    x: 585.5,
                    y: 156.9,
                    r: "4.5",
                    id: "6"
                },
                {
                    class: "st0",
                    x: 672.5,
                    y: 124.9,
                    r: "4.5",
                    id: "7"
                },
                {
                    class: "st0",
                    x: 492.5,
                    y: 186.9,
                    r: "4.5",
                    id: "8"
                },
                {
                    class: "st0",
                    x: 331.5,
                    y: 132.9,
                    r: "4.5",
                    id: "9"
                },
                {
                    class: "st0",
                    x: 150.5,
                    y: 186.9,
                    r: "4.5",
                    id: "10"
                },
                {
                    class: "st0",
                    x: 118.5,
                    y: 117.9,
                    r: "4.5",
                    id: "11"
                },
            ],
            links: [{
                    source: "1",
                    target: "11"
                },
                {
                    source: "1",
                    target: "10"
                },
                {
                    source: "1",
                    target: "2"
                },
                {
                    source: "2",
                    target: "3"
                },
                {
                    source: "3",
                    target: "9"
                },
                {
                    source: "2",
                    target: "9"
                },
                {
                    source: "3",
                    target: "4"
                },
                {
                    source: "4",
                    target: "5"
                },
                {
                    source: "5",
                    target: "6"
                },
                {
                    source: "4",
                    target: "7"
                },
                {
                    source: "6",
                    target: "8"
                },
                {
                    source: "8",
                    target: "9"
                }
            ]
        }
    },
    computed: {
        height() {
            return this.width >= 1200 ? 280 : this.scale * 280;
        },
        scale() {
            return this.width >= 1200 ? 1 : this.width / 1200;
        }
    },
    mounted() {
        this.container = d3.select('#title_particle');

        this.particles.forEach(p => {
            p.x = this.scale * p.x;
            p.y = this.scale * p.y;
        })

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
            .attr('transform', `translate(${(this.width - 725*this.scale)/2}, 0)`);

        this.container
            .selectAll('circle')
            .data(this.particles)
            .enter()
            .append('circle')
            .attr('class', d => d.class)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => 3)
            .attr('transform', `translate(${(this.width - 725*this.scale)/2}, 0)`);

        this.container
            .selectAll('path')
            .data(this.paths)
            .enter()
            .append('path')
            .attr('class', d => d.class)
            .attr('d', d => d.d)
            .attr('transform', `translate(${(this.width - 725*this.scale)/2}, 0) scale(${this.scale})`);
    },
    watch: {
        width: function (val) {
            this.resize();
        }
    },
    methods: {
        resize() {
            console.log('holi');
            this.container
                .selectAll('path')
                .attr('transform',
                    `translate(${(this.width - 725*this.scale)/2}, 0) scale(${this.scale})`);

            this.container
                .selectAll('line')
                .attr('transform', `translate(${(this.width - 725*this.scale)/2}, 0)`);

            this.container
                .selectAll('circle')
                .attr('transform', `translate(${(this.width - 725*this.scale)/2}, 0)`);
        },
        boundedX(d) {
            if (this.width - (this.width - 725 * this.scale) / 2 - 10 < d.x) {
                d.x = this.width - (this.width - 725 * this.scale) / 2 - 10;
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
            if (200 * this.scale < d.y) {
                d.y = 200 * this.scale;
                d.vy = -d.vy;
                d.velbase.y = -d.velbase.y;
            } else if (d.y < 5) {
                d.y = 5;
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
            if (distance > 250 * this.scale) {
                return 0;
            } else {
                return 0.75;
            }
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
}