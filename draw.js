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

function drawLine(ctx, x1, y1, dx, dy) {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + dx, y1 + dy);
    ctx.stroke();
}

function draw(ctx) {
    baseLength = radius * (1 + ratio);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    drawLine(ctx, centerX, 0, 0, baseLength);
    ctx.beginPath();
    ctx.arc(centerX, baseLength, radius / 50, 0, 2 * Math.PI);
    ctx.fill();
    for (let i = 0; i < numberOfSlices / 2; i++) {
        const x = solve(i / numberOfSlices, ratio);
        drawLine(ctx, centerX, baseLength, +2 * radius * Math.sin(x), -2 * radius * Math.cos(x));
        drawLine(ctx, centerX, baseLength, -2 * radius * Math.sin(x), -2 * radius * Math.cos(x));
    }
    if (numberOfSlices % 2 == 0)
        drawLine(ctx, centerX, baseLength, 0, 2 * radius);
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