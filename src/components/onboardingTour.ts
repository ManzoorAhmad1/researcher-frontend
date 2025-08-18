const onboardingTour = [
    {
        element: "#workspace-dropdown",
        popover: {
          title: "🧑‍💻 Workspaces",
          description: `
          <style>
            .tour-description { color: #555; }
            .dark .tour-description, html[class~="dark"] .tour-description { color: #ffffff; }
          </style>
          <div style="text-align: center; font-family: Arial, sans-serif;">
          <p style="font-size: 16px;" class="tour-description">Centralized hub for managing research projects.</p>
          <video 
            autoPlay
            loading="lazy"
            preload="none"
            playsInline
            controls 
            style="border-radius: 8px; margin-top: 10px; max-width: 100%; width: 100%; height: auto; aspect-ratio: 16/9;"
          >
            <source src="https://shyulpexykcgruhbjihk.supabase.co/storage/v1/object/public/userProfileImage/videos/1744300622393-Workspace%20w_%20music.mp4" type="video/mp4">
            <source src="https://shyulpexykcgruhbjihk.supabase.co/storage/v1/object/public/userProfileImage/videos/1744300622393-Workspace%20w_%20music.webm" type="video/webm">
            Your browser does not support the video tag.
          </video>
          </div>
        `,
        },
      },
      {        element: "#dashboard-link",
        popover: {
          title: "📊 Dashboard",
          description: `
          <style>
            .tour-description { color: #555; }
            .dark .tour-description, html[class~="dark"] .tour-description { color: #ffffff; }
          </style>
          <div style="text-align: center; font-family: Arial, sans-serif;">
          <p style="font-size: 16px;" class="tour-description">Your central hub for trends and insights.</p>
          <video 
            autoPlay
            loading="lazy"
            preload="none"
            playsInline
            controls 
            style="border-radius: 8px; margin-top: 10px; max-width: 100%; width: 100%; height: auto; aspect-ratio: 16/9;"
          >
            <source src="https://shyulpexykcgruhbjihk.supabase.co/storage/v1/object/public/userProfileImage/videos/1744300639764-Dashboard%20w_%20music.mp4" type="video/mp4">
            <source src="https://shyulpexykcgruhbjihk.supabase.co/storage/v1/object/public/userProfileImage/videos/1744300639764-Dashboard%20w_%20music.webm" type="video/webm">
            Your browser does not support the video tag.
          </video>
          </div>
        `,
        },
      },
      {        element: "#explorer-link",
        popover: {
          title: "🔍 Topic Explorer",
          description: `
          <style>
            .tour-description { color: #555; }
            .dark .tour-description, html[class~="dark"] .tour-description { color: #ffffff; }
          </style>
          <div style="text-align: center; font-family: Arial, sans-serif;">
          <p style="font-size: 16px;" class="tour-description">Discover research topics and trends.</p>
          <video 
          autoPlay
            loading="lazy"
            preload="none"
            playsInline
            controls 
            style="border-radius: 8px; margin-top: 10px; max-width: 100%; width: 100%; height: auto; aspect-ratio: 16/9;"
          >
            <source src="https://shyulpexykcgruhbjihk.supabase.co/storage/v1/object/public/userProfileImage/videos/1744300625481-Topic%20Explorer%20w_%20music.mp4" type="video/mp4">
            <source src="https://shyulpexykcgruhbjihk.supabase.co/storage/v1/object/public/userProfileImage/videos/1744300625481-Topic%20Explorer%20w_%20music.webm" type="video/webm">
            Your browser does not support the video tag.
          </video>
          </div>
        `,
        },
      },
      {        element: "#search-papers",
        popover: {
          title: "📚 Search Papers",
          description: `
          <style>
            .tour-description { color: #555; }
            .dark .tour-description, html[class~="dark"] .tour-description { color: #ffffff; }
          </style>
          <div style="text-align: center; font-family: Arial, sans-serif;">
          <p style="font-size: 16px;" class="tour-description">Find and manage research articles easily.</p>
          <video 
          autoPlay
            loading="lazy"
            preload="none"
            playsInline
            controls 
            style="border-radius: 8px; margin-top: 10px; max-width: 100%; width: 100%; height: auto; aspect-ratio: 16/9;"
          >
            <source src="https://shyulpexykcgruhbjihk.supabase.co/storage/v1/object/public/userProfileImage/videos/1744300627395-Search%20Papers%20w_%20music.mp4" type="video/mp4">
            <source src="https://shyulpexykcgruhbjihk.supabase.co/storage/v1/object/public/userProfileImage/videos/1744300627395-Search%20Papers%20w_%20music.webm" type="video/webm">
            Your browser does not support the video tag.
          </video>
          </div>
        `,
        },
      },
      {        element: "#my-projects",
        popover: {
          title: "📁 My Projects",
          description: `
          <style>
            .tour-description { color: #555; }
            .dark .tour-description, html[class~="dark"] .tour-description { color: #ffffff; }
          </style>
          <div style="text-align: center; font-family: Arial, sans-serif;">
          <p style="font-size: 16px;" class="tour-description">Organize your research and collaborate.</p>
          <video 
          autoPlay
            loading="lazy"
            preload="none"
            playsInline
            controls 
            style="border-radius: 8px; margin-top: 10px; max-width: 100%; width: 100%; height: auto; aspect-ratio: 16/9;"
          >
            <source src="https://shyulpexykcgruhbjihk.supabase.co/storage/v1/object/public/userProfileImage/videos/1744300634986-My%20Projects%20w_%20music.mp4" type="video/mp4">
            <source src="https://shyulpexykcgruhbjihk.supabase.co/storage/v1/object/public/userProfileImage/videos/1744300634986-My%20Projects%20w_%20music.webm" type="video/webm">
            Your browser does not support the video tag.
          </video>
          </div>
        `,
        },
      },
      {        element: "#collaboration",
        popover: {
          title: "🤝 Collaboration",
          description: `
          <style>
            .tour-description { color: #555; }
            .dark .tour-description, html[class~="dark"] .tour-description { color: #ffffff; }
          </style>
          <div style="text-align: center; font-family: Arial, sans-serif;">
          <p style="font-size: 16px;" class="tour-description">Work together on research projects.</p>
          <video 
            autoPlay
            loading="lazy"
            preload="none"
            playsInline
            controls 
            style="border-radius: 8px; margin-top: 10px; max-width: 100%; width: 100%; height: auto; aspect-ratio: 16/9;"
          >
            <source src="https://shyulpexykcgruhbjihk.supabase.co/storage/v1/object/public/userProfileImage/videos/1744300636920-Collaboration%20w_%20music.mp4" type="video/mp4">
            <source src="https://shyulpexykcgruhbjihk.supabase.co/storage/v1/object/public/userProfileImage/videos/1744300636920-Collaboration%20w_%20music.webm" type="video/webm">
            Your browser does not support the video tag.
          </video>
          </div>
        `,
        },
      },
      {        element: "#search-bar",
        popover: {
          title: "🔎 Search",
          description: `
          <style>
            .tour-description { color: #555; }
            .dark .tour-description, html[class~="dark"] .tour-description { color: #ffffff; }
          </style>
          <div style="text-align: center; font-family: Arial, sans-serif;">
          <p style="font-size: 16px;" class="tour-description">Quick access to all resources.</p>
          <video 
            autoPlay
            loading="lazy"
            preload="none"
            playsInline
            controls 
            style="border-radius: 8px; margin-top: 10px; max-width: 100%; width: 100%; height: auto; aspect-ratio: 16/9;"
          >
            <source src="https://shyulpexykcgruhbjihk.supabase.co/storage/v1/object/public/userProfileImage/videos/1744300631771-Search%20Folders%20or%20Files%20w_%20music.mp4" type="video/mp4">
            <source src="https://shyulpexykcgruhbjihk.supabase.co/storage/v1/object/public/userProfileImage/videos/1744300631771-Search%20Folders%20or%20Files%20w_%20music.webm" type="video/webm">
            Your browser does not support the video tag.
          </video>
          </div>
        `,
        },
      },
      {        element: "#notificationMenu",
        popover: {
          title: "🔔 Notifications",
          description: `
          <style>
            .tour-description { color: #555; }
            .dark .tour-description, html[class~="dark"] .tour-description { color: #ffffff; }
          </style>
          <div style="text-align: center; font-family: Arial, sans-serif;">
          <p style="font-size: 16px;" class="tour-description">Stay updated with real-time alerts.</p>
          <video 
            autoPlay
            loading="lazy"
            preload="none"
            playsInline
            controls 
            style="border-radius: 8px; margin-top: 10px; max-width: 100%; width: 100%; height: auto; aspect-ratio: 16/9;"
          >
            <source src="https://shyulpexykcgruhbjihk.supabase.co/storage/v1/object/public/userProfileImage/videos/1744300633918-Notifications%20w_%20music.mp4" type="video/mp4">
            <source src="https://shyulpexykcgruhbjihk.supabase.co/storage/v1/object/public/userProfileImage/videos/1744300633918-Notifications%20w_%20music.webm" type="video/webm">
            Your browser does not support the video tag.
          </video>
          </div>
        `,
        },
      },
      {        element: "#userMenu",
        popover: {
          title: "👤 User Menu",
          description: `
          <style>
            .tour-description { color: #555; }
            .dark .tour-description, html[class~="dark"] .tour-description { color: #ffffff; }
          </style>
          <div style="text-align: center; font-family: Arial, sans-serif;">
          <p style="font-size: 16px;" class="tour-description">Manage your account and settings.</p>
          <video 
          autoPlay
            loading="lazy"
            preload="none"
            playsInline
            controls 
            style="border-radius: 8px; margin-top: 10px; max-width: 100%; width: 100%; height: auto; aspect-ratio: 16/9;"
          >
            <source src="https://shyulpexykcgruhbjihk.supabase.co/storage/v1/object/public/userProfileImage/videos/1744300642320-User%20menu%20without%20music.mp4" type="video/mp4">
            <source src="https://shyulpexykcgruhbjihk.supabase.co/storage/v1/object/public/userProfileImage/videos/1744300642320-User%20menu%20without%20music.webm" type="video/webm">
            Your browser does not support the video tag.
          </video>
          </div>
        `,
        },
      },
];

export default onboardingTour;
