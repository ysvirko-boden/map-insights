---
applyTo: "src/backend/tests/**"
---

# GitHub Copilot Test Instructions 
## Build & Test Commands

### Local Development
```powershell
# Restore packages
dotnet restore

# Build solution
dotnet build --configuration Release

# Run all unit tests
dotnet test src/backend/ --logger trx --results-directory TestResults/

# Run specific test project
dotnet test src/backend/tests/MapInsights.Core.Tests.Unit/
```

### Testing Strategy
- **Unit tests**: Per-component in `tests/unit/`
- **Integration tests**: `tests/integration/` (TBD)
- **Common test utilities**: `tests/common/`

#### Unit Test Patterns
- **Framework**: xUnit with FluentAssertions for assertions
- **Dependencies**: Moq for mocking, FluentAssertions for assertions
- **Assertions**: Use FluentAssertions: `actual.Should().NotBeNull()`, `actual.Value.Should().Be(expected)`. DO NOT use xUnit assertions directly.
- **Data-driven tests**: Use `[Theory]` with `[InlineData]` for simple cases
- **Test Data**: AutoFixture for generating test data
- **Class Structure**:
  - Use `_cut` field for class under test
  - Use `Mock<T>` fields for dependencies
  - Initialize fields in place: `private readonly Mock<T> _field = new();`
  - Use `Options.Create()` instead of mocking `IOptions<>`
  - Use `ResiliencePipeline.Empty` for simplicity
  - Use `TheoryData<T>` for `[MemberData]` methods
- **Test Data Organization**:
  - Extract common string values to `const` fields (e.g., `TestShardId`, `TestCorrelationId`)
  - Extract common complex objects to `readonly` fields (e.g., `_testKeyData`, `_testDateTime`)
  - Create helper methods for DTO/request construction with optional parameters
  - Helper methods should use expression body syntax when simple
  - Default parameters in helpers should cover the most common test case
- **Test Coding Guidelines**:
  - Use `[InlineData]` for primitive types instead of `[MemberData]`
  - Use `const` instead of `var` for string literals and primitive values
  - Use non-default test values to ensure proper mapping
  - Remove "mock" prefix from variable names
  - Format mock setup with `.Setup` starting on new line
  - Use expression body syntax for simple helper methods
  - Keep tests laconic - avoid excessive or redundant test cases
  - Focus on testing all if/else branches and main functionality paths
  - Do not validate logging behavior unless explicitly requested
  - Do not test exception propagation unless explicitly requested
  - Avoid excessive test duplication - one test per logical path
  - Always run `dotnet test` after creating tests to verify they work
- **Structure**: `tests/{ProjectName}.Tests.Unit/` following project structure
- **Global usings**: `global using Xunit;` in `Usings.cs`
- **Configuration Testing**: Use `ConfigurationBuilder().AddInMemoryCollection()` for config
- **Service Registration**: Test DI registration with `ServiceCollection` and `BuildServiceProvider()`

## When Working on This Codebase

1. **Follow existing patterns** - maintain consistency with existing code
2. **Follow unit test patterns** - use xUnit, FluentAssertions, Moq, AutoFixture
3. **No comments in code** - except `// arrange // act // assert` in tests or when explicitly requested
4. **Use primary constructors** - always prefer primary constructors (C# 12+) when possible
5. **Use collection expressions** - prefer `["item1", "item2"]` over `new List<string> { "item1", "item2" }`
6. **Use block scoped namespaces** - do not use file scoped namespaces
7. **Always use "var"** - even in for loops: `for (var i = 0; i < N; i++)`
8. **Method chaining preferred** - use fluent interfaces for service registration and configuration
9. **Builder patterns** - use appropriate builders instead of direct constructors when available
10. **Return collections** - extension methods should return the collection for chaining
11. **Be brief** - do not explain each action or obvious things
12. **Follow best practices** - use established software development patterns
13. **Use modern C# syntax** - leverage latest language features and idioms
14. **Adhere to core principles** - KISS, YAGNI, DRY, SOLID
