// routes/subscription.js
const express = require('express');
const router = express.Router();
const linkDataUpdateController = require('../controllers/linkDataUpdateController');

// Routes
router.post('/', linkDataUpdateController.LinkData);

module.exports = router;


// router.post("/modify-access", async (req, res) => {
//   const { link, companyName, activityName, employeeName } = req.body;

//   try {
//     if (!link) {
//       return res.status(400).json({
//         message: "Link is required",
//       });
//     }

//     const linkData = await prisma.link.findUnique({
//       where: { link: link },
//     });

//     if (!linkData) {
//       return res.status(404).json({
//         message: "Link not found",
//       });
//     }

//     let recievers = linkData.recievers || {};
//     // return res.json(recievers[employeeName]);
//     // Check if employeeName exists
//     if (!recievers[employeeName]) {
//       return res.status(404).json({
//         message: `Employee ${employeeName} not found`,
//       });
//     }

//     // Check if companyName exists for the employee
//     if (!recievers[employeeName][companyName]) {
//       // Add companyName with the activityName if it doesn't exist
//       recievers[employeeName][companyName] = [...activityName];
//     } else {
//       // Check if each activity's label exists in the companyName's list
//       const existingActivities = recievers[employeeName][companyName];

//       // Filter out activities that are already in the list (compare by 'label')
//       const newActivities = activityName.filter(
//         (newActivity) =>
//           !existingActivities.some(
//             (existingActivity) => existingActivity.label === newActivity.label && existingActivity.type === newActivity.type
//           )
//       );

//       // Add only new activities that don't exist in the list
//       if (newActivities.length > 0) {
//         recievers[employeeName][companyName].push(...newActivities);
//       } else {
//         return res.status(401).json({
//           message: `All provided activities already exist for company ${companyName}`,
//         });
//       }
//     }

//     // Update the recievers in the database
//     await prisma.link.update({
//       where: { link: link },
//       data: { recievers: recievers },
//     });

//     res.status(200).json({
//       message: "Access modified successfully",
//       updatedRecievers: recievers,
//     });
//   } catch (error) {
//     console.error("Error modifying access:", error);
//     return res.status(500).json({
//       error: "An error occurred while modifying access",
//     });
//   }
// });


// // Get a Link by 'link' or search by other parameters
// router.get("/", async (req, res) => {
//   const { link } = req.query; // Query parameters from the request

//   try {
//     // If `link` is provided, fetch the specific link
//     if (link) {
//       const linkData = await prisma.link.findUnique({
//         where: { link: link }
//       });

//       if (!linkData) {
//         return res.status(404).json({
//           message: "Link not found"
//         });
//       }

//       return res.status(200).json(linkData);
//     }
//   } catch (error) {
//     console.error("Error fetching links:", error);
//     return res.status(500).json({
//       error: "An error occurred while fetching links"
//     });
//   }
// });
// router.get("/access-list", async (req, res) => {
//   const { link, employeeName } = req.query; // Using query params, not req.params for GET

//   if (!link || !employeeName) {
//     return res.status(400).json({
//       error: "Missing required fields: link and employeeName are required."
//     });
//   }

//   try {
//     // Find the link in the database
//     const linkData = await prisma.link.findUnique({
//       where: { link: link }
//     });

//     if (!linkData) {
//       return res.status(404).json({
//         error: "Link not found."
//       });
//     }

//     const recieverData = linkData.recievers || {};

//     // Check if the employeeName exists in recievers
//     if (recieverData[employeeName]) {
//       return res.status(200).json({
//         employee: employeeName,
//         companies: recieverData[employeeName] // Return all companies and activities for this employee
//       });
//     } else {
//       return res.status(404).json({
//         error: `Employee '${employeeName}' not found.`
//       });
//     }

//   } catch (error) {
//     console.error("Error fetching link data:", error);
//     return res.status(500).json({
//       error: "An error occurred while fetching the data."
//     });
//   }
// });

// router.get("/employee-list", async (req, res) => {
//   const { link, selectedActivityName, selectedCompanyName } = req.query; // Use req.query for GET request

//   try {
//     if (link) {
//       const linkData = await prisma.link.findUnique({
//         where: { link: link }
//       });

//       if (!linkData) {
//         return res.status(404).json({
//           message: "Link not found"
//         });
//       }

//       // Initialize an array to store the matched employees
//       const matchedEmployees = [];

//       // Iterate over the recievers object
//       const recievers = linkData.recievers;
//       for (const [employeeName, companyData] of Object.entries(recievers)) {
//         // Check if selectedCompanyName exists in the employee's company list
//         if (companyData[selectedCompanyName]) {
//           // Check if selectedActivityName exists in the activity list for this company
//           const activities = companyData[selectedCompanyName];
//           const activityMatch = activities.some(activity => activity.value === selectedActivityName);

//           if (activityMatch) {
//             matchedEmployees.push(employeeName); // Add the employee to the result if both conditions match
//           }
//         }
//       }

//       if (matchedEmployees.length > 0) {
//         // Return the list of employees who match the company and activity
//         res.status(200).json(matchedEmployees);
//       } else {
//         res.status(404).json({
//           message: "No employees found for the given company and activity"
//         });
//       }

//     } else {
//       res.status(400).json({
//         message: "Link is required"
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       error: "An error occurred while fetching the link data"
//     });
//   }
// });
// router.get("/full-employee-list", async (req, res) => {
//   const { link } = req.query;
//   try {
//     if (link) {
//       const linkData = await prisma.link.findUnique({
//         where: { link: link }
//       });

//       if (!linkData) {
//         return res.status(404).json({
//           message: "Link not found"
//         });
//       }

//       // Assuming 'recievers' is an object with employee names as keys
//       const employeeNames = Object.keys(linkData.recievers);

//       return res.status(200).json({
//         employeeNames: employeeNames
//       });
//     } else {
//       return res.status(400).json({
//         message: "Link is required"
//       });
//     }
//   } catch (error) {
//     console.error("Error fetching employee list:", error);
//     return res.status(500).json({
//       error: "An error occurred while fetching the employee list"
//     });
//   }
// });


// router.post("/delete-company", async (req, res) => {
//   const { companyName } = req.body;
//   const { link } = req.query;
//   try {

//     if (link) {
//       const linkData = await prisma.link.findUnique({
//         where: { link: link }
//       });
//       if (!linkData) {
//         return res.status(404).json({
//           message: "Link not found"
//         });
//       }

//       const employeeNames = (linkData.recievers);
//       Object.keys(employeeNames).forEach(person => {
//         if (employeeNames[person][companyName]) {
//           delete employeeNames[person][companyName];
//         }
//       })
//       await prisma.link.update({
//         where: { link: link },
//         data: { recievers: employeeNames }
//       });

//       const personData = linkData.data;
//       Object.keys(personData).forEach(key => {
//         // Check if the key starts with the companyName
//         if (key.startsWith(companyName)) {
//           // Delete the key from this person's data
//           delete personData[key];
//         }


//       });
//       await prisma.link.update({
//         where: { link: link },
//         data: { data: personData }
//       });
//       return res.status(200).json({ message: "Company data deleted successfully" });


//     } else {
//       return res.status(400).json({ message: "Link parameter is missing" });

//     }
//   } catch (error) {
//     return res.status(500).json({
//       error: "An error occurred while fetching the company list"
//     });
//   }

// }

// )

