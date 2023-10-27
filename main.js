

let keyframes = [
    {
        activeVerse: 1,
        activeLines: [1, 2, 3, 4]
    },
    {
        activeVerse: 2,
        activeLines: [1, 2, 3, 4, 5]
    },
    {
        activeVerse: 3,
        activeLines: [1, 2, 3, 4, 5]
    }
]


let keyframeIndex = 0;


document.getElementById("forward-button").addEventListener("click", forwardClicked);
document.getElementById("backward-button").addEventListener("click", backwardClicked);



const svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

const rateByFips = new Map();

const path = d3.geoPath();


const x = d3.scaleLinear().domain([0, 0.5]).rangeRound([600, 860]); 

const color = d3.scaleThreshold()
  .domain([0.01, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4])
  .range(d3.schemeBlues[9]);

const g = svg
  .append("g")
  .attr("class", "key")
  .attr("transform", "translate(0,40)");

g.selectAll("rect")
  .data(
    color.range().map(function (d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    })
  )
  .enter()
  .append("rect")
  .attr("height", 8)
  .attr("x", function (d) {
    return x(d[0]);
  })
  .attr("width", function (d) {
    return x(d[1]) - x(d[0]);
  })
  .attr("fill", function (d) {
    return color(d[0]);
  });

g.append("text")
  .attr("class", "caption")
  .attr("x", x.range()[0])
  .attr("y", -6)
  .attr("fill", "white")
  .attr("text-anchor", "start")
  .text("Incarceration rate (%)");


g.call(
    d3
      .axisBottom(x)
      .tickSize(20)
      .tickFormat(function (x, i) {
        return i ? x : x;
      })
      .tickValues(color.domain())
  )
  .select(".domain")
  .remove();

d3.csv("incarceration_trends.csv").then((data) => {
    data.filter(d => d.year === "2018")
    .forEach(d => {
     
      if (d.fips.length === 4) {
          d.fips = "0" + d.fips;
      }
      rateByFips.set(d.fips, (+d.total_jail_pop / +d.total_pop) * 100);
    });

    d3.json("https://d3js.org/us-10m.v1.json").then(ready);
});

      
  function ready(us) {
    svg.append("g")
       .attr("class", "counties")
       .selectAll("path")
       .data(topojson.feature(us, us.objects.counties).features)
       .enter()
       .append("path")
       .attr("fill", function (d) {
         return color(d.rate = rateByFips.get(d.id));
       })
       .attr("d", path);

    svg.append("path")
       .datum(topojson.mesh(us, us.objects.states, function (a, b) {
          return a !== b;
       }))
       .attr("class", "states")
       .attr("d", path);
  }



async function initialise() {
    
    await loadData();
    initialiseSVG();
    drawKeyframe(keyframeIndex);
}


function forwardClicked() {


    if (keyframeIndex < keyframes.length - 1) {
      keyframeIndex++;
      drawKeyframe(keyframeIndex);
    }
  }
  
function backwardClicked() {
    if (keyframeIndex > 0) {
      keyframeIndex--;
      drawKeyframe(keyframeIndex);
    }
  }

function drawKeyframe(kfi) {

    let kf = keyframes[kfi];
    
    resetActiveLines();

    updateActiveVerse(kf.activeVerse);

    for (line of kf.activeLines){
        updateActiveLine(kf.activeVerse,line)
    }


    if(kf.svgUpdate){
   
        kf.svgUpdate();
    }

    
        }


function resetActiveLines() {
    d3.selectAll(".line").classed("active-line", false);
}


function updateActiveVerse(id) {
    d3.selectAll(".verse").classed("active-verse", false)

    d3.select("#verse").classed("active-verse", true)
}

function updateActiveLine(vid, lid) {

  let thisVerse = d3.select("#verse" + vid);

  thisVerse.select("#line" + lid).classed("active-line", true);
}



function scrollLeftColumnToActiveVerse(id) {
  
    var leftColumn = document.querySelector(".left-column-content");


    var activeVerse = document.getElementById("verse" + id);


    var verseRect = activeVerse.getBoundingClientRect();
    var leftColumnRect = leftColumn.getBoundingClientRect();

    var desiredScrollTop = verseRect.top + leftColumn.scrollTop - leftColumnRect.top - (leftColumnRect.height - verseRect.height) / 2;


    leftColumn.scrollTo({
        top: desiredScrollTop,
        behavior: 'smooth'
    })
}

function updateActiveVerse(id) {

    d3.selectAll(".verse").classed("active-verse", false);


    d3.select("#verse" + id).classed("active-verse", true);

    scrollLeftColumnToActiveVerse(id);
}


function initialiseSVG() {
    svg.attr("width", width);
    svg.attr("height", height);

    svg.selectAll("*").remove();

    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    chartWidth = width - margin.left - margin.right;
    chartHeight = height - margin.top - margin.bottom;

    chart = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    xScale = d3.scaleBand()
        .domain([])
        .range([0, chartWidth])
        .padding(0.1);

    yScale = d3.scaleLinear()
        .domain([])
        .nice()
        .range([chartHeight, 0]);


    chart.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text");


    chart.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale))
        .selectAll("text");


    svg.append("text")
        .attr("id", "chart-title")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("fill", "white")
        .text("");

}


async function initialise() {

    await loadData();

    initialiseSVG();

    drawKeyframe(keyframeIndex);
}


initialise();
