namespace WebApp;
public static class Acl
{
    private static Arr rules;

    public static async void Start()
    {
        // Read rules from db once a minute
        while (true)
        {
            UnpackRules(SQLQuery("SELECT * FROM acl ORDER BY allow"));
            await Task.Delay(60000);
        }
    }

    public static void UnpackRules(Arr allRules)
    {
        // Unpack db response -> routes to regexps and userRoles to arrays
        rules = allRules.Map(x => new
        {
            ___ = x,
            regexPattern = @"^" + x.route.Replace("/", @"\/") + @"\/",
            userRoles = ((Arr)Arr(x.userRoles.Split(','))).Map(x => x.Trim())
        });
    }

    public static bool Allow(
        HttpContext context, string method = "", string path = ""
    )
    {
        // Return true/allowed for everything if acl is off in Globals
        if (!Globals.aclOn) { return true; }

        // Get info about the requested route and logged in user
        method = method != "" ? method : context.Request.Method;
        path = path != "" ? path : context.Request.Path;
        var user = Session.Get(context, "user");
        var userRole = user == null ? "visitor" : user.role;
        var userEmail = user == null ? "" : user.email;

        // Go through all acl rules to and set allowed accordingly!
        var allowed = false;
        Obj appliedAllowRule = null;
        Obj appliedDisallowRule = null;
        foreach (var rule in rules)
        {
            // Get the properties of the rule as variables
            var ruleMethod = rule.method;
            var ruleRegexPattern = rule.regexPattern;
            var ruleRoles = (Arr)rule.userRoles;
            var ruleMatch = rule.match == "true";
            var ruleAllow = rule.allow == "allow";

            // Check if role, method and path is allowed according to the rule
            var roleOk = ruleRoles.Includes(userRole);
            var methodOk = method == ruleMethod || ruleMethod == "*";
            var pathOk = Regex.IsMatch(path + "/", ruleRegexPattern);
            // Note: "match" can be false - in that case we negate pathOk!
            pathOk = ruleMatch ? pathOk : !pathOk;

            // Is everything ok?
            var allOk = roleOk && methodOk && pathOk;

            // Note: We whitelist first (check all allow rules) - ORDER BY allow
            // and then we blacklist on top of that (check all disallow rules)
            var oldAllowed = allowed;
            allowed = ruleAllow ? allowed || allOk : allOk ? false : allowed;
            if (oldAllowed != allowed)
            {
                if (ruleAllow) { appliedAllowRule = rule; }
                else { appliedDisallowRule = rule; }
            }
        }
        // Collect info for debug log
        var toLog = Obj(new { userRole, userEmail, aclAllowed = allowed });
        if (Globals.detailedAclDebug && appliedAllowRule != null)
        {
            toLog.aclAppliedAllowRule = appliedAllowRule;
        }
        if (Globals.detailedAclDebug && appliedDisallowRule != null)
        {
            toLog.aclAppliedDisallowRule = appliedDisallowRule;
        }
        if (userEmail == "") { toLog.Delete("userEmail"); }
        DebugLog.Add(context, toLog);
        // Return if allowed or not
        return allowed;
    }
}