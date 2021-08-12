const figlet = require("figlet");
figlet.text(
  "EMPLOYEE TRACKER",
  {
    font: "Small",
    horizontalLayout: "fitted",
    verticalLayout: "fitted",
    width: 50,
    whitespaceBreak: true,
  },
  function (err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.log(data);
  }
);
