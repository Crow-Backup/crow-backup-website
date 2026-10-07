{
  "title": "Release Notes",
  "date": "2025-11-13T20:08:35",
  "lastmod": "2025-11-13T21:27:54",
  "url": "/en/release-notes/",
  "translationKey": "579",
  "source": "https://crowbackup.ch/en/release-notes/",
  "sourceId": 579,
  "cover": "/wp-content/uploads/2024/03/Was-ist-Crow-Backup-snapshot.png",
  "coverAlt": "Was ist Crow Backup? (Erklärvideo)",
  "coverWidth": 1920,
  "coverHeight": 1080,
  "description": "Update database migration for older files"
}

## Version 1.126 | Update database migration for older files {#_version_1_126_update_database_migration_for_older_files}

-   Update database migration for older files
    

## Version 1.125 | UI updates, backup fix, docs, compatibility {#_version_1_125_ui_updates_backup_fix_docs_compatibility}

-   Backups no longer fail when an item’s type changes
    
-   Updated App Store package for macOS 13 and Apple Silicon compatibility
    

## Version 1.124 | Improved restore, new video, UI updates {#_version_1_124_improved_restore_new_video_ui_updates}

-   Fixed restoring large files
    
-   Added animated App Store preview video
    
-   Abort backup requests when unmounting
    
-   Show send/received progress chart
    
-   Restore canceled when path selection is cancelled
    

## Version 1.123 | Improved backup reliability, security, and interface {#_version_1_123_improved_backup_reliability_security_and_interface}

-   Crow Backup goes offline when the backup folder is missing
    
-   New files use stronger encryption
    
-   Backups display a “paused” state when a friend is offline
    
-   Data is retried automatically if no reply comes back
    
-   Dark‑mode toggle added
    

## Version 1.122 | New UI features and stability fixes {#_version_1_122_new_ui_features_and_stability_fixes}

-   Fixed layout glitches after UI upgrade
    
-   Improved message handling for faster replies
    
-   Clean up old data after cache restore
    
-   Restore progress now shows stages
    
-   Faster Windows updates without delays
    
-   Fixed Linux startup not launching automatically after an update
    

## Version 1.121 | Minor UI enhancements {#_version_1_121_minor_ui_enhancements}

-   Updated backup icons for clearer status display
    
-   Added progress chart to show backup progress on the dashboard
    
-   Included live status indicator next to each backup row
    
-   Improved translations: fixed wording on the dashboard
    

## Version 1.120 | Signed, faster, cleaner {#_version_1_120_signed_faster_cleaner}

-   Backup listing is now much quicker
    
-   File details show again correctly in backup lists (name, size, last modified)
    
-   Linux: Update process is more reliable with longer wait time and runs as the normal user
    
-   Launch made faster
    

## Version 1.119 | Security & reliability updates {#_version_1_119_security_reliability_updates}

-   Fixed minor security problems
    
-   Mac App Store provisioning profile updated for new certificate
    

## Version 1.118 | macOS ARM support, startup fix {#_version_1_118_macos_arm_support_startup_fix}

-   Added download links for macOS on Apple Silicon
    
-   Updated updater to use the new Apple Silicon links
    
-   Fixed a hang that could occur when starting the daemon during an update
    

## Version 1.117 | Reliability and platform improvements {#_version_1_117_reliability_and_platform_improvements}

-   Detect real CPU on Macs for better performance
    
-   Added signature to the new architecture Mac installer
    
-   Adjusted WebKit integration for App Store review
    

## Version 1.116 | Whitelisting fixed, UI & Mac support {#_version_1_116_whitelisting_fixed_ui_mac_support}

-   Fixed closing behavior of InteractiveModal dialogs.
    
-   Drafted support for Apple Silicon Macs with updated updater payloads.
    
-   Corrected German date declension in approximate duration strings.
    
-   Improved date formatting to match user locale in the packaged app.
    
-   Enhanced progress popup to display upload/download speed.
    

## Version 1.115 | Mail link fixed, backup loading improved {#_version_1_115_mail_link_fixed_backup_loading_improved}

-   Mail link now opens the download page directly.
    
-   Older backup details now load correctly.
    
-   Tooltip positioning has been corrected.
    

## Version 1.114 | Performance, reliability, stability, and speed fixes {#_version_1_114_performance_reliability_stability_and_speed_fixes}

-   Improved transmission while complex messages are being handled.
    

## Version 1.113 | Backup progress UI, reliability & fixes {#_version_1_113_backup_progress_ui_reliability_fixes}

-   New user‑friendly backup progress screen
    
-   Faster and more reliable letterbox updates
    
-   Improved view of backup file list
    
-   Minor bug fixes for smoother operation
    

## Version 1.112 | Improved security, performance, stability, and reliability {#_version_1_112_improved_security_performance_stability_and_reliability}

-   Database files are now kept smaller and more efficient
    
-   Log‑in speed is limited to keep accounts safe
    
-   Letterbox updates prevent the app from stopping after failures
    
-   Network communication has been optimized for better speed
    

## Version 1.111 | Bug fixes, startup improvements, and stability {#_version_1_111_bug_fixes_startup_improvements_and_stability}

-   Added a new startup feature to help macOS apps launch more reliably.
    
-   Corrected an issue with quotation marks in the Windows installer.
    

## Version 1.110 | Resolved App Store signing errors {#_version_1_110_resolved_app_store_signing_errors}

-   Fixed internal API usage issues in JavaFX for App Store distribution
    
-   Added signing for all dylib files to ensure successful App Store builds
    

## Version 1.109 | Java 25 {#_version_1_109_java_25}

-   Updated the underlying Java version to 25
    
-   Adapted the build process to accommodate changes in Java 25, ensuring compatibility and optimal performance
    

## Version 1.108 | Fixed Mac Building {#_version_1_108_fixed_mac_building}

-   Updated the packaging process for macOS builds.
    

## Version 1.107 | Improved backup error visibility and storage limits {#_version_1_107_improved_backup_error_visibility_and_storage_limits}

-   Fixed character display for combined diacritics.
    
-   Users now see the exact reason when a backup fails.
    
-   Set min and max storage limits based on available disk space ==== Version 1.106 | Improved sync speed, stability, and visibility
    
-   Metadata restoration now runs faster by retrieving all data in parallel
    
-   Duplicate cache restoration prevented when a friend reconnects
    
-   Backup scheduling now checks for ongoing cache restores before starting
    
-   Local metadata cache updates only every 5 days
    
-   Letterbox server connects directly to friends, no intermediate disk storage
    
-   Added simple statistics on data received by the letterbox server
    
-   Fixed a crash that occurred when writing letters without a token
    
-   Resolved race condition in the database storage during cache updates
    

## Version 1.105 | Bug fixes & performance improvements {#_version_1_105_bug_fixes_performance_improvements}

-   Resolved file‑deletion and IO error issues during backup.
    
-   Restored friend backup notifications.
    
-   Improved shutdown behavior to prevent hangs.
    
-   Cached byte counts for faster backup transmission.
    

## Version 1.104 | Improved backup speed {#_version_1_104_improved_backup_speed}

-   Cache speeds up calculation of how much storage friends are using.
    

## Version 1.103 | Improved backup stability & UI updates {#_version_1_103_improved_backup_stability_ui_updates}

-   Fix rare backup error for large files
    

## Version 1.102 | Friend status, log, large file fix {#_version_1_102_friend_status_log_large_file_fix}

-   Improved detection of offline friends
    
-   Added release notes
    
-   Archived logs now use .log extension
    
-   Fixed issue with large files
    

## Version 1.101 | Improved server handling, shutdown, and backup {#_version_1_101_improved_server_handling_shutdown_and_backup}

-   Fixed server creation when old URLs linger
    
-   Resolved shutdown prevention issue
    
-   Fixed backup errors when permissions are missing
    

## Version 1.100 | Bug fixes and UI improvements overall {#_version_1_100_bug_fixes_and_ui_improvements_overall}

-   Fixed a reauthentication glitch that appeared when opening the GUI while the app was still auto‑logging in.
    
-   Resolved a startup hang that could occur when launching the program.
    
-   Added a new authentication page in the GUI for cookie‑based login.
    
-   Improved the login and signup experience by setting a new browser cookie.
    
-   Limited backup‑failure warnings to once every 5 minutes to reduce noise.
    
-   Shows a warning when a backup of a friend cannot be stored.
    
-   Stores user data in a safer location instead of the root home directory.
    
-   Corrected titles and gendered language throughout the interface.
    

## Version 1.99 | Security, login, UI, improved cleanup functionality {#_version_1_99_security_login_ui_improved_cleanup_functionality}

-   New files are now more secure with doubled encryption iterations.
    
-   You’re automatically redirected to login if you try to view the dashboard without being logged in.
    
-   A convenient login link appears on any page you’re not on the login screen, like the feedback page.
    
-   Translation files have been cleaned of unnecessary quote marks.
    
-   The dashboard link is now available directly from the main GUI.
    
-   Letterbox deletion works more reliably, removing all related data correctly.
    

## Version 1.98 | UI enhancements, smoother backups, typo fixes {#_version_1_98_ui_enhancements_smoother_backups_typo_fixes}

-   Improved spacing of the left overview bar
    
-   Improved wrapping and prevented horizontal scrolling on dashboard
    
-   Improved launch progress bar timing
    
-   Fixed typos and translations
    
-   Disabled buttons and added warnings when no letterbox is configured or friend is offline
    
-   Gracefully stops running backups when shutting down
    
-   Backup configurations are now removed immediately after deletion request
    
-   Fixed umlaut rendering in filenames
    
-   Prevented wrapping of backup and time info in dashboard for long messages
    
-   Fixed gender declination in friends overview disk space configuration
    

## Version 1.97 | Privacy & friendship updates {#_version_1_97_privacy_friendship_updates}

-   Friends no longer see your error messages
    
-   New members receive an invite from the people who invited them
    

## Version 1.96 | Diagram support restored, UI button fix {#_version_1_96_diagram_support_restored_ui_button_fix}

-   Diagrams now show up correctly in the documentation.
    
-   Buttons in interactive dialogs are disabled after a click to avoid accidental repeats.
    
-   Performance and reliability improvements have been applied.
    
-   Minor documentation updates improve navigation and clarity.
    

## Version 1.95 | Enhancements for stability, usability, and localization {#_version_1_95_enhancements_for_stability_usability_and_localization}

-   Server shutdown is now quicker and smoother
    
-   Email replies now contain proper reply addresses
    
-   Backup process no longer fails on special socket files
    
-   Event descriptions are fully translated
    
-   Setup guide updated with password instructions
    
-   Update downloads now time out instead of hanging
    

## Version 1.94 | Improved friend handling, stability and documentation {#_version_1_94_improved_friend_handling_stability_and_documentation}

-   Friend posts now retry if a friend is temporarily offline.
    
-   Connections only start after a friendship is confirmed.
    
-   Letterbox links are shown only when the friendship is confirmed.
    
-   Added a warning if you try to add yourself as a friend.
    
-   Fixed issues that caused letterboxes to behave inconsistently.
    
-   Resolved errors when a user has multiple letterbox URLs.
    
-   New guide explains how to set up the server.
    

## Version 1.93 | Minor stability improvements {#_version_1_93_minor_stability_improvements}

-   Fixed crash when no Letterbox is requested
    
-   Auto‑repair corrupted storage files and retry automatically
    

## Version 1.92 | Overview, login, letterbox, privacy, enhancements, features {#_version_1_92_overview_login_letterbox_privacy_enhancements_features}

-   Added an easy way to see how much storage you’re using.
    
-   Auto‑login is now more reliable.
    
-   When setting up a new letterbox you can choose whether to assume the receiver is online or offline.
    
-   Log entries now hide sensitive letterbox read‑ and write‑tokens for better privacy.
    

## Version 1.91 | Updater off, friend box, log clean, delete fix {#_version_1_91_updater_off_friend_box_log_clean_delete_fix}

-   Disabled automatic updater in Docker containers; update the container yourself instead.
    
-   Added a letterbox display only when you have friends.
    
-   Cleaned up unnecessary update logs.
    
-   Fixed an issue where deleting a post URL didn’t fully remove it.
    

## Version 1.90 | Fixed deployment issues across systems globally {#_version_1_90_fixed_deployment_issues_across_systems_globally}

-   Fixed letterbox deployment SQL errors
    
-   Corrected general deployment SQL errors
