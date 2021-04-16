new Vue({
  el: "#app",
  data: {
    tableColumns: [
      {
        title: "Id",
        field: "id",
      },
      {
        title: "Account No.",
        field: "accountNo",
      },
      {
        title: "External Id",
        field: "externalId",
      },
      {
        title: "Active",
        field: "active",
      },
      {
        title: "Activation Date",
        field: "activationDate",
      },
      {
        title: "First Name",
        field: "firstname",
      },
      {
        title: "Last Name",
        field: "lastname",
      },
      {
        title: "Display Name",
        field: "displayName",
      },
      {
        title: "Mobile No.",
        field: "mobileNo",
      },
      {
        title: "Date of Birth",
        field: "dateOfBirth",
      },
      {
        title: "Gender",
        field: "gender",
      },
      {
        title: "Office Id",
        field: "officeId",
      },
      {
        title: "Office Name",
        field: "officeName",
      },
      {
        title: "Staff Id",
        field: "staffId",
      },
      {
        title: "StaffName",
        field: "staffName",
      },
      {
        title: "Submitted on Date",
        field: "submittedOnDate",
      },
      {
        title: "Submitted by Username",
        field: "submittedByUsername",
      },
      {
        title: "Submitted by Firstname",
        field: "submittedByFirstname",
      },
      {
        title: "Submitted by Lastname",
        field: "submittedByLastname",
      },
      {
        title: "Activated on Date",
        field: "activatedOnDate",
      },
      {
        title: "Activated by Username",
        field: "activatedByUsername",
      },
      {
        title: "Activated by Firstname",
        field: "activatedByFirstname",
      },
      {
        title: "Activated by Lastname",
        field: "activatedByLastname",
      },
      {
        title: "Is Staff",
        field: "isStaff",
      },
      {
        title: "Country ISO Code",
        field: "countryIsoCode",
      },
    ],
    users: [],
    filterQuery: "",
    orderByField: "id",
    fetchError: false,
  },
  computed: {
    filteredUsers: function () {
      var vm = this;
      return _.orderBy(
        vm.users.filter(function (user) {
          var regex = new RegExp(vm.filterQuery, "i");
          return (
            regex.test(user.accountNo) ||
            regex.test(user.firstname) ||
            regex.test(user.lastname) ||
            regex.test(user.displayName)
          );
        }),
        vm.orderByField
      );
    },
    statusMessage: function () {
      if (this.fetchError) {
        return "There was a problem fetching the users. JSONPlaceholder might be down.";
      }
      if (this.users.length) {
        if (!this.filteredUsers.length) {
          return "Sorry, no matching users were found.";
        }
      } else {
        return "Loading...";
      }
    },
  },
  created: function () {
    this.fetchUsers();
  },
  methods: {
    fetchUsers: function () {
      var vm = this;
      vm.users = [];
      vm.fetchError = false;
      fetch("http://localhost:3000/pageItems")
        .then(function (response) {
          return response.json();
        })
        .then(function (json) {
          vm.users = _.map(json, function (user) {
            return serializeUser(user);
          });
        })
        .catch(function () {
          vm.fetchError = true;
        });
    },
    getField: function (object, field) {
      return _.at(object, field)[0];
    },
    downloadExcel: function () {
      var tableSelect = document.getElementById("usertable").cloneNode(true);

      var excelContent = "data:application/vnd.ms-excel,\uFEFF";

      var tds = tableSelect.getElementsByTagName("td");
      for (var i = 0; i < tds.length; i++) {
        var td = tds[i];
        if (!isNaN(td.innerHTML) && Number(td.innerHTML) > 100000000) {
          td.setAttribute(
            "style",
            "mso-number-format: '0'; border: 1px solid rgb(128, 128, 128); font-family: Padauk; vertical-align: middle; text-align: right;"
          );
        } else {
          td.setAttribute(
            "style",
            "border: 1px solid rgb(128, 128, 128); font-family: Padauk; vertical-align: middle; text-align: right;"
          );
        }
      }

      excelContent += tableSelect.outerHTML.replace(/ /g, "%20");

      var data = excelContent;
      var link = document.createElement("a");
      link.href = data;
      link.download = "export.xls";
      link.click();
    },
    downloadCSV: function () {
      var csvContent = "data:text/csv;charset=utf-8,\uFEFF";
      csvContent += [
        this.tableColumns
          .map((column) => {
            return column.title;
          })
          .join(","),
        ...this.users.map((item) => Object.values(item).join(",")),
      ]
        .join("\n")
        .replace(/(^\[)|(\]$)/gm, "");

      var data = encodeURI(csvContent);
      var link = document.createElement("a");
      link.href = data;
      link.download = "export.csv";
      link.click();
    },
    downloadPDF: function () {
      var doc = new jsPDF("l", "pt", "a2");
      doc.addFileToVFS("Padauk-Regular.ttf", padaukBase64);
      doc.addFont("Padauk-Regular.ttf", "Padauk", "normal");
      doc.setFont("Padauk");

      doc.autoTable({
        html: "#usertable",
        theme: "grid",
        didParseCell: function (table) {
          if (table.section === 'head') {
            table.settings.showHead="firstPage";
            table.cell.styles.textColor  = '#000000';
            table.cell.styles.fontSize = '12';
            table.cell.styles.font  = 'Padauk';
            table.cell.styles.fontStyle  = 'bold';
            table.cell.styles.halign ='center';
            table.cell.styles.valign ='middle';
            table.cell.styles.fillColor ='#fff';
            table.cell.styles.lineColor = 234;
            table.cell.styles.lineWidth = 1;
          }
          else {
            if(table.section === 'body'){
              table.cell.styles.fontSize = '10';
              table.cell.styles.textColor  = '#000000'; 
              table.cell.styles.font  = 'Padauk'; 
              table.cell.styles.halign ='right';
              table.cell.styles.valign ='bottom';
              table.cell.styles.lineColor = 234;
              table.cell.styles.lineWidth = 1;
            }
          }
        },
      });

      doc.save("export.pdf");
    },
  },
});

function serializeUser(input) {
  var output = {};

  output.id = input.id;
  output.accountNo = input.accountNo;
  output.externalId = input.externalId;
  output.active = input.active;
  output.activationDate = new moment(new Date(...input.activationDate)).format(
    "DD/MM/YYYY"
  );
  output.firstname = input.firstname;
  output.lastname = input.lastname;
  output.displayName = input.displayName;
  output.mobileNo = input.mobileNo;
  output.dateOfBirth = new moment(new Date(...input.dateOfBirth)).format(
    "DD/MM/YYYY"
  );
  output.gender = input.gender.name;
  output.officeId = input.officeId;
  output.officeName = input.officeName;
  output.staffId = input.staffId;
  output.staffName = input.staffName;

  output.submittedOnDate = new moment(
    new Date(...input.timeline.submittedOnDate)
  ).format("DD/MM/YYYY");
  output.submittedByUsername = input.timeline.submittedByUsername;
  output.submittedByFirstname = input.timeline.submittedByFirstname;
  output.submittedByLastname = input.timeline.submittedByLastname;

  output.activatedOnDate = new moment(
    new Date(...input.timeline.activatedOnDate)
  ).format("DD/MM/YYYY");
  output.activatedByUsername = input.timeline.activatedByUsername;
  output.activatedByFirstname = input.timeline.activatedByFirstname;
  output.activatedByLastname = input.timeline.activatedByLastname;

  output.isStaff = input.isStaff;
  output.countryIsoCode = input.countryIsoCode;

  return output;
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

