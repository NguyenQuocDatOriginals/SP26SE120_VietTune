using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Application.Mapper.DTOs.Response;
using static VietTuneArchive.Application.Mapper.DTOs.Request.AuthRequest;
using ForgotPasswordRequest = VietTuneArchive.Application.Mapper.DTOs.Request.AuthRequest.ForgotPasswordRequest;
using LoginRequest = VietTuneArchive.Application.Mapper.DTOs.Request.AuthRequest.LoginRequest;
using RegisterRequest = VietTuneArchive.Application.Mapper.DTOs.Request.AuthRequest.RegisterRequest;
using ResetPasswordRequest = VietTuneArchive.Application.Mapper.DTOs.Request.AuthRequest.ResetPasswordRequest;

namespace VietTuneArchive.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        // POST: /api/v1/auth/register
        [HttpPost("register")]
        [AllowAnonymous]
        public ActionResult<AuthResponse> Register([FromBody] RegisterRequest request)
        {
            // TODO: Thực hiện tạo tài khoản, lưu DB, sinh token...
            var response = new AuthResponse
            {
                Success = true,
                Message = "Register success",
                AccessToken = "fake-access-token",
                RefreshToken = "fake-refresh-token"
            };

            return Ok(response);
        }

        // POST: /api/v1/auth/login
        [HttpPost("login")]
        [AllowAnonymous]
        public ActionResult<AuthResponse> Login([FromBody] LoginRequest request)
        {
            // TODO: Validate user + password, sinh token
            var response = new AuthResponse
            {
                Success = true,
                Message = "Login success",
                AccessToken = "fake-access-token",
                RefreshToken = "fake-refresh-token"
            };

            return Ok(response);
        }

        // POST: /api/v1/auth/refresh-token
        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public ActionResult<TokenResponse> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            // TODO: Validate refresh token, cấp access token mới
            var response = new TokenResponse
            {
                AccessToken = "new-fake-access-token",
                RefreshToken = "new-fake-refresh-token"
            };

            return Ok(response);
        }

        // POST: /api/v1/auth/logout
        [HttpPost("logout")]
        //[Authorize]
        public ActionResult<BaseResponse> Logout()
        {
            // TODO: Revoke token hiện tại (ghi vào blacklist, v.v.)
            var response = new BaseResponse
            {
                Success = true,
                Message = "Logout success"
            };

            return Ok(response);
        }

        // POST: /api/v1/auth/forgot-password
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public ActionResult<BaseResponse> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            // TODO: Gửi email chứa link reset password
            var response = new BaseResponse
            {
                Success = true,
                Message = "Reset password email sent"
            };

            return Ok(response);
        }

        // POST: /api/v1/auth/reset-password
        [HttpPost("reset-password")]
        [AllowAnonymous]
        public ActionResult<BaseResponse> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            // TODO: Xác thực token reset, đặt lại mật khẩu
            var response = new BaseResponse
            {
                Success = true,
                Message = "Password reset success"
            };

            return Ok(response);
        }
    }
}
