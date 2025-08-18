import { driver } from "driver.js";


export const driverObj = driver({
  showProgress: true,  
  steps: [
     {
        element: '#template-name',
        popover: {
          title: 'Template Name and Status',
          description: 'This section displays the name and current status of the template.'
        }
      },
     {
        element: '#select-model',
        popover: {
          title: 'Select Model',
          description: 'Choose a model from the available options to proceed with the configuration.'
        }
      },
      {
        element: '#select-template-key',
        popover: {
          title: 'Select Template Key',
          description: 'Pick a key from the template to apply specific settings or modifications.'
        }
      },
      {
        element: '#change-key-name',
        popover: {
          title: 'Change Selected Key Name',
          description: 'Modify the name of the currently selected key to better reflect its purpose.'
        }
      },
      {
        element: '#add-question-btn',
        popover: {
          title: 'Add Question',
          description: 'Click this button to add a new question to the current key.'
        }
      },
      {
        element: '#add-question',
        popover: {
          title: 'Write a Question',
          description: 'Enter the question related to the selected key. Provide relevant details for better clarity.'
        }
      },
      {
        element: '#add-question-btn',
        popover: {
          title: 'Add More Questions',
          description: 'You can add additional questions. Ensure they follow the same structure and provide a single answer sequentially.'
        }
      },
      {
        element: '#see-chart-area',
        popover: {
          title: 'View Question Chart',
          description: 'Visualize the questions in a chart format to analyze the data effectively.'
        }
      },
      {
        element: '#remove-question-btn',
        popover: {
          title: 'Remove Question',
          description: 'Click this button to delete a question if it is no longer required.'
        }
      },
      {
        element: '#see-chart-area',
        popover: {
          title: 'View Updated Chart',
          description: 'Check the updated chart after making changes to ensure accuracy.'
        }
      },
      {
        element: '#add-prompt-btn',
        popover: {
          title: 'Add Prompt',
          description: 'Press this button to include a new key change in the main template prompt.'
        }
      },
      {
        element: '#submit-template',
        popover: {
          title: 'Submit Template',
          description: 'Finalize and submit the updated prompt template for processing.'
        }
      },
  ]
});

export const driverObjGuide = driver({
  showProgress: true,
  steps: [
    {
      element: "#template-name",
      popover: {
        title: "Template Information",
        description: "This header shows the template's name and other key metadata extracted from your document.",
      },
    },
    {
      element: "#template-sections-panel",
      popover: {
        title: "Template Sections",
        description: "Here are the different content sections of your template. Click on one to load its questions into the editor.",
      },
    },
    {
      element: "#manage-sections-btn",
      popover: {
        title: "Manage Sections",
        description: "Click here to add new content sections or rename existing ones.",
      },
    },
    {
      // This is the new step for deleting a single section
      element: ".individual-section-delete-btn",
      popover: {
        title: "Delete a Section",
        description: "Click the minus icon next to any section to remove it individually. A confirmation will appear.",
      },
    },
    {
      element: "#remove-all-contents-btn",
      popover: {
        title: "Remove All Contents",
        description: "Use this button to quickly delete all custom sections you've added. A confirmation with a safety timer will appear to prevent accidents."
      }
    },
    {
      element: "#prompt-editor-panel",
      popover: {
        title: "Prompt Editor",
        description: "This is the main workspace. Here you can edit the questions for the selected section. You can also drag the nodes to rearrange their positions.",
      },
    },
    {
        element: "#add-question-btn",
        popover: {
          title: "Add a Question",
          description: "Click the plus button to add a new question node to the flow for the current section.",
        },
      },
    {
      element: "#advanced-actions-toggle",
      popover: {
        title: "Advanced Actions",
        description: "Check this box to reveal advanced settings on each question node, allowing for more specific instructions like changing the response type or language.",
      },
    },
    {
      element: "#preview-panel-toggle",
      popover: {
        title: "Toggle Preview",
        description: "Click the arrow to show or hide the preview panel, where you can see the AI-generated content.",
      },
    },
    {
        element: "#regenerate-preview-btn",
        popover: {
          title: "Regenerate Preview",
          description: "After editing questions, click here to update the preview with the latest AI-generated responses.",
        },
      },
    {
      element: "#template-settings-btn",
      popover: {
        title: "Global Settings",
        description: "Configure global settings for the entire template, such as making it public or setting the default response style.",
      },
    },
    {
      element: "#save-template-btn",
      popover: {
        title: "Save Your Template",
        description: "When you've finished making all your changes, click here to save the entire template.",
      },
    },
  ],
});


//        showProgress: true,
//        overlayClickNext: true,
//        steps: [
//          {
//            element: "#app-logo",
//            popover: {
//              title: "Logo",
//              description: "This is the logo of ResearchCollab.",
//            },
//          },
//          {
//            element: "#workspace-dropdown",
//            popover: {
//              title: "Workspaces",
//              description: "Select a workspace from here.",
//            },
//          },
//          {
//            element: "#dashboard-link",
//            popover: {
//              title: "Dashboard",
//              description: "Navigate to your main dashboard.",
//            },
//          },
//          {
//            element: "#search-papers",
//            popover: {
//              title: "Search Papers",
//              description: "Find research papers here.",
//            },
//          },
//          {
//            element: "#my-projects",
//            popover: {
//              title: "My Projects",
//              description: "Manage your projects from here.",
//            },
//          },
//          {
//            element: "#ai-chat",
//            popover: {
//              title: "AI Chat",
//              description: "Access AI-powered chat support.",
//            },
//          },
//        ],
//      } as any);

export const driverObjTour = driver({
  showProgress: true,
  steps: [
    {
      element: "#template-name",
      popover: {
        title: "Template Information",
        description: "This header shows the template's name and other key metadata extracted from your document.",
      },
    },
    {
      element: "#template-sections-panel",
      popover: {
        title: "Template Sections",
        description: "Here are the different content sections of your template. Click on one to load its questions into the editor.",
      },
    },
    {
      element: "#manage-sections-btn",
      popover: {
        title: "Manage Sections",
        description: "Click here to add new content sections or rename existing ones.",
      },
    },
    {
      // This is the new step for deleting a single section
      element: ".individual-section-delete-btn",
      popover: {
        title: "Delete a Section",
        description: "Click the minus icon next to any section to remove it individually. A confirmation will appear.",
      },
    },
    {
      element: "#remove-all-contents-btn",
      popover: {
        title: "Remove All Contents",
        description: "Use this button to quickly delete all custom sections you've added. A confirmation with a safety timer will appear to prevent accidents."
      }
    },
    {
      element: "#prompt-editor-panel",
      popover: {
        title: "Prompt Editor",
        description: "This is the main workspace. Here you can edit the questions for the selected section. You can also drag the nodes to rearrange their positions.",
      },
    },
    {
        element: "#add-question-btn",
        popover: {
          title: "Add a Question",
          description: "Click the plus button to add a new question node to the flow for the current section.",
        },
      },
    {
      element: "#advanced-actions-toggle",
      popover: {
        title: "Advanced Actions",
        description: "Check this box to reveal advanced settings on each question node, allowing for more specific instructions like changing the response type or language.",
      },
    },
    {
      element: "#preview-panel-toggle",
      popover: {
        title: "Toggle Preview",
        description: "Click the arrow to show or hide the preview panel, where you can see the AI-generated content.",
      },
    },
    {
        element: "#regenerate-preview-btn",
        popover: {
          title: "Regenerate Preview",
          description: "After editing questions, click here to update the preview with the latest AI-generated responses.",
        },
      },
    {
      element: "#template-settings-btn",
      popover: {
        title: "Global Settings",
        description: "Configure global settings for the entire template, such as making it public or setting the default response style.",
      },
    },
    {
      element: "#save-template-btn",
      popover: {
        title: "Save Your Template",
        description: "When you've finished making all your changes, click here to save the entire template.",
      },
    },
  ],
});


//        showProgress: true,
//        overlayClickNext: true,
//        steps: [
//          {
//            element: "#app-logo",
//            popover: {
//              title: "Logo",
//              description: "This is the logo of ResearchCollab.",
//            },
//          },
//          {
//            element: "#workspace-dropdown",
//            popover: {
//              title: "Workspaces",
//              description: "Select a workspace from here.",
//            },
//          },
//          {
//            element: "#dashboard-link",
//            popover: {
//              title: "Dashboard",
//              description: "Navigate to your main dashboard.",
//            },
//          },
//          {
//            element: "#search-papers",
//            popover: {
//              title: "Search Papers",
//              description: "Find research papers here.",
//            },
//          },
//          {
//            element: "#my-projects",
//            popover: {
//              title: "My Projects",
//              description: "Manage your projects from here.",
//            },
//          },
//          {
//            element: "#ai-chat",
//            popover: {
//              title: "AI Chat",
//              description: "Access AI-powered chat support.",
//            },
//          },
//        ],
//      } as any);
