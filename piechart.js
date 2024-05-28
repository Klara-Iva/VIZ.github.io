async function piechart(countyName, year) {
  var height = 400;
  var radius = 150;

  var color = d3.scale
    .ordinal()
    .domain(["Children", "Pupils", "Students", "Regular Students"])
    .range(["#02367B", "#006CA5", "#0496C7", "#04BADE"]);

  if (year) {
    var arc = d3.svg
      .arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

    var pie = d3.layout
      .pie()
      .sort(null)
      .value(function (d) {
        return d.value;
      });

    try {
      const [
        childrenResponse,
        pupilsResponse,
        studentsResponse,
        regularStudentsResponse,
      ] = await Promise.all([
        fetch("datasets/children.json"),
        fetch("datasets/pupils.json"),
        fetch("datasets/students.json"),
        fetch("datasets/regularStudents.json"),
      ]);

      const [childrenData, pupilsData, studentsData, regularStudentsData] =
        await Promise.all([
          childrenResponse.json(),
          pupilsResponse.json(),
          studentsResponse.json(),
          regularStudentsResponse.json(),
        ]);

      const countyChildrenData = childrenData[countyName];
      const countyPupilsData = pupilsData[countyName];
      const countyStudentsData = studentsData[countyName];
      const countyRegularStudentsData = regularStudentsData[countyName];

      const pieData = [
        {
          name: "Children",
          value: countyChildrenData ? countyChildrenData[year] : 0,
        },
        {
          name: "Pupils",
          value: countyPupilsData ? countyPupilsData[year] : 0,
        },
        {
          name: "Students",
          value: countyStudentsData ? countyStudentsData[year] : 0,
        },
        {
          name: "Regular Students",
          value: countyRegularStudentsData
            ? countyRegularStudentsData[year]
            : 0,
        },
      ];

      const total = pieData.reduce((sum, d) => sum + d.value, 0);

      d3.select(".row-2").select("svg").remove();

      var parentDiv = document.querySelector(".row-2");

      var parentWidth = parentDiv.clientWidth;

      var svg = d3
        .select(".row-2")
        .append("svg")
        .attr("width", parentWidth)
        .attr("height", height)
        .append("g")
        .attr(
          "transform",
          "translate(" + parentWidth / 2 + "," + height / 2 + ")"
        );

      var g = svg
        .selectAll(".arc")
        .data(pie(pieData))
        .enter()
        .append("g")
        .attr("class", "arc");

      g.append("path")
        .attr("d", arc)
        .style("fill", function (d) {
          return color(d.data.value / total);
        });

      var labelArc = d3.svg
        .arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);
      g.append("text")
        .attr("transform", function (d) {
          var pos = labelArc.centroid(d);
          pos[0] = pos[0] * 1.6;
          pos[1] = pos[1] * 1.6;
          return "translate(" + pos + ")";
        })
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .html(function (d) {
          const percentage = ((d.data.value / total) * 100).toFixed(1);
          return `<tspan>${d.data.name}:</tspan><tspan x="0" dy="1.2em">${percentage}%</tspan>`;
        });

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
}
