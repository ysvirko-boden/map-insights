using MapInsights.Api.Features.Health.Models;

namespace MapInsights.Api.Tests.Unit.Features.Health.Models
{
    public class HealthCheckResponseTests
    {
        private readonly Fixture _fixture = new();

        [Fact]
        public void Status_DefaultValue_ShouldBeHealthy()
        {
            // arrange
            var response = new HealthCheckResponse();

            // act
            var status = response.Status;

            // assert
            status.Should().Be("Healthy");
        }

        [Fact]
        public void Timestamp_DefaultValue_ShouldBeUtcNow()
        {
            // arrange
            var before = DateTime.UtcNow;
            var response = new HealthCheckResponse();
            var after = DateTime.UtcNow;

            // act
            var timestamp = response.Timestamp;

            // assert
            timestamp.Should().BeOnOrAfter(before).And.BeOnOrBefore(after);
        }

        [Fact]
        public void Status_CanBeSet()
        {
            // arrange
            var response = new HealthCheckResponse();
            const string expectedStatus = "Unhealthy";

            // act
            response.Status = expectedStatus;

            // assert
            response.Status.Should().Be(expectedStatus);
        }

        [Fact]
        public void Timestamp_CanBeSet()
        {
            // arrange
            var response = new HealthCheckResponse();
            var expectedTimestamp = _fixture.Create<DateTime>();

            // act
            response.Timestamp = expectedTimestamp;

            // assert
            response.Timestamp.Should().Be(expectedTimestamp);
        }
    }
}
