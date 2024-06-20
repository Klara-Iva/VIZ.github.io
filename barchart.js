function barchart(countyName, firstChoice, secondChoice) {
  updateBarChart([]);

  async function fetchData() {
    try {
      let firstData, secondData;
      const firstResponse = await fetch(firstChoice.dataValue);
      if (!firstResponse.ok) {
        throw new Error("Network response was not ok");
      }
      firstData = await firstResponse.json();

      if (secondChoice) {
        const secondResponse = await fetch(secondChoice.dataValue);
        if (!secondResponse.ok) {
          throw new Error("Network response was not ok");
        }
        secondData = await secondResponse.json();
      }

      const chartData = [];
      const countyFirstData = firstData[countyName];
      const countySecondData = secondChoice ? secondData[countyName] : null;

      if (countyFirstData) {
        for (const year in countyFirstData) {
          if (countyFirstData.hasOwnProperty(year)) {
            const dataPoint = {
              year: year,
              firstCount: countyFirstData[year],
              secondCount: countySecondData ? countySecondData[year] : null,
              totalCount: countySecondData
                ? countyFirstData[year] + countySecondData[year]
                : countyFirstData[year],
            };
            chartData.push(dataPoint);
          }
        }
        updateBarChart(chartData, countyName, firstChoice, secondChoice);
      } else {
        console.log("Data not found in the dataset");
        updateBarChart([]);
      }
    } catch (error) {
      updateBarChart([]);
    }
  }

  fetchData();
}

function updateBarChart(data, countyName, firstChoice, secondChoice) {
  const margin = { top: 20, right: 90, bottom: 45, left: 100 };
  const width = 700 - margin.left - margin.right;
  const height = 380 - margin.top - margin.bottom;

  d3.select(".row-1").select("svg").remove();
  d3.select(".row-1").style("margin-top","20px");


  var parentDiv = document.querySelector(".row-2");
  var parentWidth = parentDiv.clientWidth;

  const svg = d3
    .select(".row-1")
    .append("svg")
    .attr("width", parentWidth + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr(
      "transform",
      "translate(" + (margin.left + 20) + "," + margin.top + ")"
    );

  const xScale = d3.scale
    .ordinal()
    .domain(
      data.map(function (d) {
        return d.year;
      })
    )
    .rangeRoundBands([0, width], 0.6);
    

  const yScale = d3.scale
    .linear()
    .domain([
      0,
      d3.max(data, function (d) {
        return (
          d.firstCount +
          d3.max(data, function (d) {
            return d.firstCount / 10;
          })
        );
      }) || 0,
    ])
    .range([height, 0]);

  const yScaleLibraries = d3.scale
    .linear()
    .domain([
      0,
      d3.max(data, function (d) {
        return d.secondCount
          ? d.secondCount +
              d3.max(data, function (d) {
                return d.secondCount / 10;
              })
          : 0;
      }) || 0,
    ])
    .range([height, 0])
   ;

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.svg.axis().scale(xScale).orient("bottom"))
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1);

  svg
    .append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(0,0)")
    .call(d3.svg.axis().scale(yScale).orient("left"))
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
   

  if (secondChoice) {
    svg
      .append("g")
      .attr("class", "y axis libraries-axis")
      .attr("transform", "translate(" + (width ) + ",0)")
      .call(d3.svg.axis().scale(yScaleLibraries).orient("right"))
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .attr("stroke-width","1px")
      .style("opacity", 1);
  }

  svg
    .append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.bottom - 5) + ")"
    )
    .style("text-anchor", "middle")
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .text("Years");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .text(firstChoice ? firstChoice.xLabel : "");

  if (secondChoice) {
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", width + margin.right - 20)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .text(secondChoice ? secondChoice.xLabel : "");
  }

  const tooltip = d3
    .select(".row-1")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "lightgray")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("font-size", "12px");

  svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function (d) {
      return xScale(d.year) + xScale.rangeBand() / 10;
    })
    .attr("width", xScale.rangeBand() / 2)
    .attr("y", height)
    .attr("height", 0)
    .attr("fill", firstChoice ? firstChoice.color : "#ffffff")
    .on("mouseover", function (d) {
      tooltip.style("visibility", "visible").text(d.firstCount);
    })
    .on("mousemove", function () {
      tooltip
        .style("top", d3.event.pageY - 15 + "px")
        .style("left", d3.event.pageX + 15 + "px");
    })
    .on("mouseout", function () {
      tooltip.style("visibility", "hidden");
    })
    .transition()
    .duration(1000)
    .attr("y", function (d) {
      return yScale(d.firstCount);
    })
    .attr("height", function (d) {
      return height - yScale(d.firstCount);
    });

  if (secondChoice) {
    svg
      .selectAll(".library-bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "library-bar")
      .attr("x", function (d) {
        return xScale(d.year) + (xScale.rangeBand() * 6) / 10;
      })
      .attr("width", xScale.rangeBand() / 2)
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", secondChoice ? secondChoice.color : "#ffffff")
      .on("mouseover", function (d) {
        tooltip.style("visibility", "visible").text(d.secondCount);
      })
      .on("mousemove", function () {
        tooltip
          .style("top", d3.event.pageY - 10 + "px")
          .style("left", d3.event.pageX + 10 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
      })
      .transition()
      .duration(1000)
      .attr("y", function (d) {
        return yScaleLibraries(d.secondCount);
      })
      .attr("height", function (d) {
        return height - yScaleLibraries(d.secondCount);
      });
  }

  var lineFirst = d3.svg
    .line()
    .x(function (d) {
      return xScale(d.year) + xScale.rangeBand() / 4;
    })
    .y(function (d) {
      return yScale(d.firstCount);
    });

  svg
    .append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", lineFirst)
    .style(
      "stroke",
      firstChoice ? firstChoice.color.replace(/,\s*\d\.\d+\)/, ")") : "#ffffff"
    )
    .style("fill", "none")
    .style("stroke-width", "3px")
    .style("opacity", 0)
    .transition()
    .delay(700)
    .duration(1000)
    .style("opacity", 1);

  if (secondChoice) {
    var lineSecond = d3.svg
      .line()
      .x(function (d) {
        return xScale(d.year) + (xScale.rangeBand() * 3) / 4;
      })
      .y(function (d) {
        return yScaleLibraries(d.secondCount);
      });

    svg
      .append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", lineSecond)
      .style(
        "stroke",
        secondChoice
          ? secondChoice.color.replace(/,\s*\d\.\d+\)/, ")")
          : "#ffffff"
      )
      .style("fill", "none")
      .style("stroke-width", "3px")
      .style("opacity", 0)
      .transition()
      .delay(700)
      .duration(1000)
      .style("opacity", 1);
  }
}
