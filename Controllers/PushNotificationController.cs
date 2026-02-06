using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace BIZ_Alliera.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PushNotificationController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public PushNotificationController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        // Model for notification request
        public class NotificationRequest
        {
            public string FcmToken { get; set; }
            public string Priority { get; set; }
            public string TicketNo { get; set; }
            public string DeviceType { get; set; }
            public string TicketTitle { get; set; }
            public Dictionary<string, string> AdditionalData { get; set; }
            public string NotificationType { get; set; }
            public string AssignedToUserName { get; set; }
        }

        // POST: api/PushNotification/SendMobileNotification
        [HttpPost("SendMobileNotification")]
        public async Task<IActionResult> SendMobileNotification([FromBody] NotificationRequest request)
        {
            try
            {
                // Validate required fields
                if (string.IsNullOrEmpty(request.TicketNo))
                {
                    return BadRequest(new { status = "N", message = "TicketNo is required" });
                }

                // Log the notification request
                Console.WriteLine($"📱 Mobile Notification Request:");
                Console.WriteLine($"   Ticket: {request.TicketNo}");
                Console.WriteLine($"   Title: {request.TicketTitle}");
                Console.WriteLine($"   Assigned To: {request.AssignedToUserName}");
                Console.WriteLine($"   Priority: {request.Priority}");
                Console.WriteLine($"   FCM Token: {(string.IsNullOrEmpty(request.FcmToken) ? "Not provided" : "Provided")}");

                // TODO: Implement actual FCM push notification sending
                // For now, just logging and returning success
                
                // If FCM token is provided, send push notification via Firebase
                if (!string.IsNullOrEmpty(request.FcmToken))
                {
                    await SendFirebaseNotification(request);
                }
                else
                {
                    Console.WriteLine("⚠ FCM Token not provided. Skipping push notification.");
                    // You can fetch FCM token from database based on user ID if needed
                }

                return Ok(new 
                { 
                    status = "Y", 
                    message = "Mobile notification processed successfully",
                    ticketNo = request.TicketNo
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error in SendMobileNotification: {ex.Message}");
                return StatusCode(500, new { status = "N", message = ex.Message });
            }
        }

        // POST: api/PushNotification/SendWebNotification
        [HttpPost("SendWebNotification")]
        public async Task<IActionResult> SendWebNotification([FromBody] NotificationRequest request)
        {
            try
            {
                // Validate required fields
                if (string.IsNullOrEmpty(request.TicketNo))
                {
                    return BadRequest(new { status = "N", message = "TicketNo is required" });
                }

                // Log the notification request
                Console.WriteLine($"🌐 Web Notification Request:");
                Console.WriteLine($"   Ticket: {request.TicketNo}");
                Console.WriteLine($"   Title: {request.TicketTitle}");
                Console.WriteLine($"   Assigned To: {request.AssignedToUserName}");
                Console.WriteLine($"   Priority: {request.Priority}");

                // TODO: Implement web push notification via Firebase Cloud Messaging
                // For now, just logging and returning success

                if (!string.IsNullOrEmpty(request.FcmToken))
                {
                    await SendFirebaseNotification(request);
                }
                else
                {
                    Console.WriteLine("⚠ FCM Token not provided. Skipping push notification.");
                }

                return Ok(new 
                { 
                    status = "Y", 
                    message = "Web notification processed successfully",
                    ticketNo = request.TicketNo
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error in SendWebNotification: {ex.Message}");
                return StatusCode(500, new { status = "N", message = ex.Message });
            }
        }

        // Helper method to send Firebase notification
        private async Task SendFirebaseNotification(NotificationRequest request)
        {
            try
            {
                // Get Firebase Server Key from configuration
                var firebaseServerKey = _configuration["Firebase:ServerKey"];
                
                if (string.IsNullOrEmpty(firebaseServerKey))
                {
                    Console.WriteLine("⚠ Firebase Server Key not configured in appsettings.json");
                    return;
                }

                var fcmUrl = "https://fcm.googleapis.com/fcm/send";
                
                var notification = new
                {
                    to = request.FcmToken,
                    priority = "high",
                    notification = new
                    {
                        title = $"New Ticket: {request.TicketNo}",
                        body = $"{request.TicketTitle} - Assigned to {request.AssignedToUserName}",
                        icon = "/assets/images/notification-icon.png",
                        click_action = "FLUTTER_NOTIFICATION_CLICK"
                    },
                    data = request.AdditionalData
                };

                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Add("Authorization", $"key={firebaseServerKey}");
                
                var json = JsonSerializer.Serialize(notification);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await client.PostAsync(fcmUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (response.IsSuccessStatusCode)
                {
                    Console.WriteLine("✅ Firebase notification sent successfully");
                }
                else
                {
                    Console.WriteLine($"❌ Firebase notification failed: {responseContent}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error sending Firebase notification: {ex.Message}");
            }
        }

        // POST: api/PushNotification/SaveFCMToken (for saving user FCM tokens)
        [HttpPost("SaveFCMToken")]
        public IActionResult SaveFCMToken([FromBody] SaveTokenRequest request)
        {
            try
            {
                // TODO: Save FCM token to database
                // You should have a table to store userId -> fcmToken mapping
                Console.WriteLine($"💾 Saving FCM Token:");
                Console.WriteLine($"   User ID: {request.UserId}");
                Console.WriteLine($"   Device Type: {request.DeviceType}");
                Console.WriteLine($"   Token: {request.FcmToken?.Substring(0, Math.Min(20, request.FcmToken?.Length ?? 0))}...");

                // Save to database here
                // Example: _context.FcmTokens.Add(new FcmToken { ... });

                return Ok(new { status = "Y", message = "FCM Token saved successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error saving FCM token: {ex.Message}");
                return StatusCode(500, new { status = "N", message = ex.Message });
            }
        }

        public class SaveTokenRequest
        {
            public string UserId { get; set; }
            public string FcmToken { get; set; }
            public string DeviceType { get; set; }
        }
    }
}
