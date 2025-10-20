// Extension methods for strings
// (and one for objects that can be strings)
namespace WebApp;

public static partial class StringUtils
{
    public static string Regplace(
        this string str, string pattern, string replacement
    )
    {
        return Regex.Replace(str, pattern, replacement);
    }

    public static bool Match(this string str, string pattern)
    {
        return Regex.IsMatch(str, pattern);
    }

    public static int ToInt(this string str)
    {
        return Int32.Parse(str);
    }

    // Try to convert a string to number (int or double)
    // if it is possilbe - otherwise leave it as if
    public static object TryToNum(this string str)
    {
        var numStr = str.Replace(',', '.');
        return IsInt(numStr) ? Int64.Parse(numStr) :
            IsDouble(numStr) ? Double.Parse(numStr, CultureInfo.InvariantCulture) : str;
    }

    // This is an extension for objects, rather than strings:
    // first check if it is a string - then if so run TryToNum
    public static object TryToNumber(this object obj)
    {
        return obj is string str ? str.TryToNum() : obj;
    }

    // Regexes and methods for testing if a string
    // contains an integer or a double/decimal number
    [GeneratedRegex(@"^\d{1,}$")]
    private static partial Regex MatchInt();

    [GeneratedRegex(@"^[\d\.]{1,}$")]
    private static partial Regex MatchDouble();

    private static bool IsInt(string x)
    {
        return MatchInt().IsMatch(x);
    }

    private static bool IsDouble(string x)
    {
        return MatchDouble().IsMatch(x);
    }
}