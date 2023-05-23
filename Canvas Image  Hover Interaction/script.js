

console.clear();

const cards = Array.from(document.querySelectorAll(".card"));
const cardOptions = [
	{
		imageURL: {
			default: "https://source.unsplash.com/8xznAGy4HcY/400x600",
			hovered: "https://source.unsplash.com/Xc6gtOwSMSA/400x600"
		},
		totalParticles: 1500,
		mouseRange: 80,
		particlesConfig: {
			jumpToRandomPosition: false,
			fill: true,
			randomRadius: true,
			minRadius: 1,
			maxRadius: 2
		}
	},
	{
		imageURL: {
			default: "https://source.unsplash.com/wQImoykAwGs/400x600",
			hovered: "https://source.unsplash.com/QsWG0kjPQRY/400x600"
		},
		totalParticles: 2500,
		particlesConfig: {
			jumpToRandomPosition: true,
			fill: true,
			shape: "square",
			radius: 2
		}
	},
	{
		imageURL: {
			default: "https://source.unsplash.com/sLAk1guBG90/400x600",
			hovered: "https://source.unsplash.com/xe-ss5Tg2mo/400x600"
		},
		totalParticles: 2500,
		particlesConfig: {
			jumpToRandomPosition: false,
			bounceFromEdges: false,
			fill: false,
			shape: "hexagon",
			radius: 1
		}
	}
];

const imageURLS = cardOptions
	.map((option) => Object.values(option.imageURL))
	.flat();

// --------------------- CLASSES ----------------------------

class App {
	init() {
		// after all images are loaded remove loader
		// (this is not the best way to do so but it gets the job done)
		loadImages(imageURLS, (images) => {
			// this array holds the images in a sub array
			// i.e [img, img, img, img, img, img] ==> [[img, img], [img, img], [img, img]]
			const splitedImagesArray = splitArray(images, 2);

			cards.forEach((card, index) => {
				new Canvas({
					parent: card.querySelector(".card__image--inner"),
					dimensions: {
						width: card.getBoundingClientRect().width,
						height: card.getBoundingClientRect().height
					},
					...cardOptions[index],
					images: {
						default: splitedImagesArray[index][0],
						hovered: splitedImagesArray[index][1]
					}
				});
			});

			// hide the loading wrapper
			document.querySelector(".loading__wrapper").classList.add("hide");

			// let the gsap animation begin
			gsap
				.timeline({
					delay: 0.8,
					defaults: {
						duration: 1.5,
						stagger: 0.1,
						ease: "expo.out"
					}
				})
				.fromTo(
					cards.map((card) => card.querySelector(".card__image")),
					{
						translateY: "-100%"
					},
					{
						translateY: "0%"
					}
				)
				.fromTo(
					cards.map((card) => card.querySelector(".card__image--inner")),
					{
						translateY: "100%"
					},
					{
						translateY: "0%"
					},
					0
				)
				.fromTo(
					cards.map((card) => card.querySelector(".card__text--inner")),
					{
						translateY: "100%"
					},
					{
						duration: 1.2,
						translateY: "0%"
					},
					0.4
				);
		});
	}
}

class Canvas {
	constructor(options = {}) {
		// the parent where the canvas will be appended
		this.parent = options.parent;

		// canvas dimensions
		this.dimensions = options.dimensions;

		// all imageURL's, images(optional) & imagesData that are required
		this.imageURL = options.imageURL || {};
		this.images = options.images || {};
		this.imagesData = options.imagesData || {
			default: null,
			hovered: null
		};
		this.currentImageData = null;

		// Array where all the particles will be stored
		this.particles = null;
		this.totalParticles = options.totalParticles || 400;

		// boolean which changes to 'true' when hovered, oe else false
		this.hovered = false;

		// particles configs
		this.particlesConfig = options.particlesConfig;

		// mouse range and mouse particle instance
		this.mouseRange = options.mouseRange || null;
		this.mouse = null;

		// initialize the canvas
		this.init();
	}

	init() {
		// create the canvas element
		this.canvas = document.createElement("canvas");
		// get the canvas context
		this.ctx = this.canvas.getContext("2d");
		// set the canvas dimensions
		this.canvas.width = this.dimensions.width;
		this.canvas.height = this.dimensions.height;

		const initialize = () => {
			// this variable holds the current image data
			this.currentImageData = this.imagesData.default;

			// add many Particle instances
			this.addParticles(this.totalParticles);
			// start rendering the canvas
			this.startRender();
			// initialize all the canvas events
			this.initEvents();
			// append the canvas on the parent
			this.parent.appendChild(this.canvas);
		};

		// what happens here is if the user/dev provides the loaded image directly then use the images provided by the use directly
		// and if the user provides the URL for the image then load the images from the URL and initialize
		if (
			!this.images.hasOwnProperty("default") &&
			!this.images.hasOwnProperty("hovered")
		) {
			// load all the images that are required and after all the images are loaded the callback is called.
			loadImages([this.imageURL.default, this.imageURL.hovered], (images) => {
				// set the image data so that they can be accessed later when needed
				this.imagesData.default = returnImageData(images[0], this.dimensions);
				this.imagesData.hovered = returnImageData(images[1], this.dimensions);
				initialize();
			});
		} else {
			// set the image data so that they can be accessed later when needed
			this.imagesData.default = returnImageData(
				this.images.default,
				this.dimensions
			);
			this.imagesData.hovered = returnImageData(
				this.images.hovered,
				this.dimensions
			);
			initialize();
		}

		// init mouse particle
		if (this.mouseRange != null) {
			this.mouse = new Particle({
				ctx: this.ctx,
				position: {
					x: 0,
					y: 0
				},
				radius: this.mouseRange,
				color: "#000",
				avoisEdges: true,
				shape: "circle"
			});
		}
	}

	initEvents() {
		const onMouseEnter = () => {
			this.hovered = true;
			this.currentImageData = this.imagesData.hovered;
		};
		const onMouseLeave = () => {
			this.hovered = false;
			this.currentImageData = this.imagesData.default;
		};
		const onMouseMove = (e) => {
			if (this.mouse != null && this.hovered) {
				this.mouse.position.x = e.offsetX;
				this.mouse.position.y = e.offsetY;
			}
		};

		this.canvas.addEventListener("mouseenter", onMouseEnter);
		this.canvas.addEventListener("mouseleave", onMouseLeave);
		this.canvas.addEventListener("mousemove", onMouseMove);
	}

	addParticles(n) {
		this.particles = new Particles({
			ctx: this.ctx,
			totalParticles: n,
			maxBounds: { width: this.dimensions.width, height: this.dimensions.height },
			imageData: this.currentImageData,
			particlesConfig: this.particlesConfig
		});
	}

	updateParticleColor(imageData, particle) {
		const color = returnPixelColor(imageData, Math.floor(this.dimensions.width), {
			x: Math.floor(particle.position.x),
			y: Math.floor(particle.position.y)
		});
		particle.updateColor(color);
	}

	startRender() {
		requestAnimationFrame(() => this.render());
	}

	render() {
		// this.ctx.clearRect(0, 0, this.dimensions.width, this.dimensions.height);

		// loop through all the particles
		this.particles.particles.forEach((particle) => {
			if (this.mouseRange != null) {
				// if the mouse range is not null then calculate the dist between mouse particle & all the other particles
				const d = dist(this.mouse.position, particle.position);
				// if the dist between the particles is less than the summation of the radius of the mouse particle & the other particle, that means they are intersecting
				if (d < this.mouse.radius + particle.radius && this.hovered) {
					// update the color of the intersecting particle only if mouse is hovered
					this.updateParticleColor(this.imagesData.hovered, particle);
				}
				// else update every other particle too
				else this.updateParticleColor(this.imagesData.default, particle);
			}
			// if the mouserange is null then update all particles at once
			else this.updateParticleColor(this.currentImageData, particle);
		});

		this.particles.update();

		requestAnimationFrame(() => this.render());
	}
}

class Particles {
	constructor(options = {}) {
		this.ctx = options.ctx; // canvas context
		this.totalParticles = options.totalParticles;
		this.maxBounds = options.maxBounds;
		this.imageData = options.imageData;

		// array that holds all the particles
		this.particles = [];

		// all the particles config
		this.particlesConfig = {
			jumpToRandomPosition: options.particlesConfig.hasOwnProperty(
				"jumpToRandomPosition"
			)
				? options.particlesConfig.jumpToRandomPosition
				: false,
			growAndShrink: options.particlesConfig.hasOwnProperty("growAndShrink")
				? options.particlesConfig.growAndShrink
				: false,
			fill: options.particlesConfig.hasOwnProperty("fill")
				? options.particlesConfig.fill
				: true,
			bounceFromEdges: options.particlesConfig.hasOwnProperty("bounceFromEdges")
				? options.particlesConfig.bounceFromEdges
				: true,
			shape: options.particlesConfig.hasOwnProperty("shape")
				? options.particlesConfig.shape
				: "circle",
			radius: options.particlesConfig.hasOwnProperty("radius")
				? options.particlesConfig.radius
				: 5,
			randomRadius: options.particlesConfig.hasOwnProperty("randomRadius")
				? options.particlesConfig.randomRadius
				: false,
			maxRadius: options.particlesConfig.hasOwnProperty("maxRadius")
				? options.particlesConfig.maxRadius
				: 5,
			minRadius: options.particlesConfig.hasOwnProperty("minRadius")
				? options.particlesConfig.minRadius
				: 2,
			maxVelocity: options.particlesConfig.hasOwnProperty("maxVelocity")
				? options.particlesConfig.maxVelocity
				: 8
		};

		this.init();
	}

	init() {
		const ctx = this.ctx;
		const color = "transparent";
		for (let i = 0; i < this.totalParticles; i++) {
			const radius = this.particlesConfig.randomRadius
				? randomIntegerFromRange(
					this.particlesConfig.minRadius,
					this.particlesConfig.maxRadius
				)
				: this.particlesConfig.radius;
			const position = {
				x: randomIntegerFromRange(radius, this.maxBounds.width - radius),
				y: randomIntegerFromRange(radius, this.maxBounds.height - radius)
			};
			this.particles.push(
				new Particle({
					ctx,
					position,
					radius,
					color,
					imageData: this.imageData,
					maxVelocity: 8,
					bounceFromEdges: this.particlesConfig.bounceFromEdges,
					shape: this.particlesConfig.shape,
					edges: { width: this.maxBounds.width, height: this.maxBounds.height }
				})
			);
		}
	}

	update() {
		// loop through particles, draw & update each particle
		this.particles.forEach((particle) => {
			particle.draw();
			if (this.particlesConfig.fill) particle.fillShape();
			else particle.strokeShape();

			particle.update();

			if (this.particlesConfig.growAndShrink)
				particle.growAndShrink(particle.minRadius * 0.65);

			if (!this.particlesConfig.jumpToRandomPosition) particle.updatePosition();
			else
				particle.jumpToRandomPosition({
					width: this.maxBounds.width,
					height: this.maxBounds.height
				});
		});
	}
}

class Particle {
	constructor(options = {}) {
		this.ctx = options.ctx;

		this.position = options.position || {
			x: 0,
			y: 0
		};
		this.maxVelocity = options.maxVelocity || 5;
		this.velocity = options.velocity || {
			x: (0.5 - Math.random()) * this.maxVelocity,
			y: (0.5 - Math.random()) * this.maxVelocity
		};

		this.radius = options.radius;
		this.minRadius = this.radius;

		this.color = options.color;

		this.imageData = options.imageData;

		this.rotation = 0;
		this.rotationIncrement = randomIntegerFromRange(2, 5);

		this.stroke = false;
		this.fill = true;

		this.shape = options.shape || "circle";

		this.edges = options.edges || null;
		this.bounceFromEdges = options.bounceFromEdges;
		this.avoidEdges = options.avoidEdges || false;

		this.tick = 0;
		this.tickIncrement = 0.02 + Math.random() * 0.03;
	}

	draw() {
		this.ctx.beginPath();
		this.ctx.save();
		this.ctx.translate(this.position.x, this.position.y);
		this.ctx.rotate((Math.PI / 180) * this.rotation);
		this.drawShape(this.shape);
		this.ctx.restore();
		this.ctx.closePath();
	}

	fillShape() {
		this.ctx.fillStyle = this.color;
		this.ctx.fill();
	}

	strokeShape() {
		this.ctx.strokeStyle = this.color;
		this.ctx.stroke();
	}

	drawShape(shape) {
		if (shape === "square")
			this.ctx.rect(-this.radius / 2, -this.radius / 2, this.radius, this.radius);
		else if (shape === "circle") this.ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
		else if (shape === "hexagon") {
			this.ctx.moveTo(this.radius * Math.cos(0), this.radius * Math.sin(0));
			for (let side = 0; side < 7; side++) {
				this.ctx.lineTo(
					this.radius * Math.cos((side * 2 * Math.PI) / 6),
					this.radius * Math.sin((side * 2 * Math.PI) / 6)
				);
			}
		}
	}

	update() {
		if (this.bounceFromEdges) this.changeVelocityOnBounce(this.edges);
		else this.continueFromEdge();

		this.rotation += this.rotationIncrement;
		this.tick += this.tickIncrement;
	}

	updatePosition() {
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}

	jumpToRandomPosition(bounds) {
		this.position.x = Math.random() * bounds.width;
		this.position.y = Math.random() * bounds.height;
	}

	growAndShrink(max) {
		this.radius = this.minRadius + Math.abs(Math.sin(this.tick)) * max;
	}

	updateColor(color) {
		this.color = color;
	}

	continueFromEdge() {
		if (!this.avoidEdges) {
			if (this.position.x > this.edges.width) this.position.x = 0;
			else if (this.position.x < 0) this.position.x = this.edges.width;
			if (this.position.y > this.edges.height) this.position.y = 0;
			else if (this.position.y < 0) this.position.y = this.edges.height;
		}
	}

	changeVelocityOnBounce() {
		if (!this.avoidEdges) {
			if (
				this.position.x + this.radius > this.edges.width ||
				this.position.x - this.radius < 0
			)
				this.velocity.x *= -1;
			if (
				this.position.y + this.radius > this.edges.height ||
				this.position.y - this.radius < 0
			)
				this.velocity.y *= -1;
		}
	}
}

// ---------------- UTILITY FUNCTIONS ------------------------

function randomIntegerFromRange(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function dist(a, b) {
	return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function splitArray(array, n) {
	let [...arr] = array;
	var res = [];
	while (arr.length) {
		res.push(arr.splice(0, n));
	}
	return res;
}

function returnPixelColor(imageData, width, position) {
	const index = (position.x + position.y * width) * 4;
	let pixel = {
		r: imageData.data[index + 0],
		g: imageData.data[index + 1],
		b: imageData.data[index + 2]
	};
	return `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`;
}

function toDataURL(url) {
	return new Promise((resolve, reject) => {
		var xhr = new XMLHttpRequest();
		xhr.onload = function () {
			var reader = new FileReader();
			reader.onloadend = function () {
				resolve(reader.result);
			};
			reader.readAsDataURL(xhr.response);
		};
		xhr.onerror = reject;
		xhr.open("GET", url);
		xhr.responseType = "blob";
		xhr.send();
	});
}

function returnImageData(image, dimensions) {
	const imageCanvas = document.createElement("canvas");
	const imageCanvasCtx = imageCanvas.getContext("2d");
	imageCanvas.width = dimensions.width;
	imageCanvas.height = dimensions.height;
	imageCanvasCtx.drawImage(image, 0, 0, imageCanvas.width, imageCanvas.height);
	return imageCanvasCtx.getImageData(
		0,
		0,
		imageCanvas.width,
		imageCanvas.height
	);
}

function loadImage(imageURL, callback) {
	toDataURL(imageURL).then((data) => {
		const IMAGE = new Image();
		IMAGE.src = data;
		IMAGE.onload = function () {
			callback(IMAGE);
		};
	});
}

function loadImages(imagesURLS, callback) {
	const totalImageToLoad = imagesURLS.length;
	let curentImageIndex = 0;
	let imagesArray = [];

	const load = () => {
		loadImage(imagesURLS[curentImageIndex], (image) => {
			imagesArray.push(image);
			curentImageIndex++;
			if (curentImageIndex === totalImageToLoad) callback(imagesArray);
			else load();
		});
	};

	load();
}

// initiate the App instance
const app = new App();
app.init();
