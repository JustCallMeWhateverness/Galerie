// "Built in": System and Microsoft specific
global using System.Text.RegularExpressions;
global using System.Text.Json;
global using Microsoft.AspNetCore.Diagnostics;
global using Microsoft.Extensions.FileProviders;
global using System.Globalization;

// Nuget packages
global using Microsoft.Data.Sqlite;
global using BCryptNet = BCrypt.Net.BCrypt;
global using Dyndata;
global using static Dyndata.Factory;

// Internal
global using WebApp;
global using static WebApp.Shared;
global using static WebApp.RequestBodyParser;
global using static WebApp.DbQuery;