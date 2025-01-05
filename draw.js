let radius, centerX, centerY, ratio, numberOfSlices;

document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("canvas");
    const canvasWrapper = document.getElementById("canvas_wrapper");
    const ctx = canvas.getContext("2d");

    radius = Math.floor(Math.min(canvas.width, canvas.height) / 2);
    centerX = Math.floor(canvas.width / 2);
    centerY = Math.floor(canvas.height / 2);
    ratio = 4 / 5;
    numberOfSlices = document.getElementById("slices").value;

    draw(ctx);

    document.getElementById("slices").addEventListener("input", function () {
        numberOfSlices = this.value;
        draw(ctx);
    });

    canvasWrapper.addEventListener("mousemove", function (e) {
        const rect = canvasWrapper.getBoundingClientRect();
        let posX = e.clientX - rect.left;
        let posY = e.clientY - rect.top;

        ratio = Math.sqrt((posX - centerX) ** 2 + (posY - centerY) ** 2) / radius;

        cosine = (centerY - posY) / Math.sqrt((posX - centerX) ** 2 + (posY - centerY) ** 2);
        trans = (Math.PI - Math.acos(cosine));
        if (posX > centerX)
            trans *= -1
        canvas.style.transform = `rotate(${trans}rad)`;

        draw(ctx);
    });
});

function draw(ctx) {
    baseLength = radius * (1 + ratio);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, baseLength);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX, baseLength, radius / 50, 0, 2 * Math.PI);
    ctx.fill();
    for (let i = 0; i < numberOfSlices / 2; i++) {
        const x = solve(i / numberOfSlices, ratio);
        ctx.moveTo(centerX, baseLength);
        ctx.lineTo(centerX + 2 * radius * Math.sin(x), baseLength - 2 * radius * Math.cos(x));
        ctx.stroke();

        ctx.moveTo(centerX, baseLength);
        ctx.lineTo(centerX - 2 * radius * Math.sin(x), baseLength - 2 * radius * Math.cos(x));
        ctx.stroke();
    }
    if (numberOfSlices % 2 == 0) {
        ctx.moveTo(centerX, baseLength);
        ctx.lineTo(centerX, baseLength + 2 * radius);
        ctx.stroke();
    }
}

function relAreaFraction(alpha, v) {
    const term1 = alpha + Math.asin(v * Math.sin(alpha));
    const numerator = v * Math.sin(term1) + term1;
    return numerator / (2 * Math.PI);
}

function relAreaFractionDiff(alpha, v) {
    const term1 = v * Math.sin(alpha);
    const term2 = Math.sqrt(1 - term1 * term1);
    const numerator =
        (term2 + v * Math.cos(alpha)) *
        (1 + v * Math.cos(alpha + Math.asin(term1)));
    return numerator / (2 * Math.PI * term2);
}

function solve(funcVal, v) {
    let alpha = funcVal * 2 * Math.PI;
    while (true) {
        const funcValCur = relAreaFraction(alpha, v);
        if (Math.abs(funcVal - funcValCur) < 1e-4) {
            break;
        }
        let step = -(funcValCur - funcVal) / relAreaFractionDiff(alpha, v)

        step = Math.max(step, -Math.abs(alpha / 2));
        step = Math.min(step, Math.abs(alpha / 2));

        alpha += step;
    }
    return alpha;
}