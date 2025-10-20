namespace WebApp;
public static partial class Session
{
    // Touch the session - set modified to now!
    public static void Touch(HttpContext context)
    {
        SQLQuery(
            @"UPDATE sessions SET modified = DATETIME('now')
              WHERE id = $id",
            new { GetRawSession(context).id }
        );
    }

    // Delete old sessions
    public static async void DeleteOldSessions()
    {
        var hours = Globals.sessionLifeTimeHours;
        while (true)
        {
            SQLQuery(
                @$"DELETE FROM sessions WHERE 
                   DATETIME('now', '-{hours} hours') > modified"
            );
            // Wait one minute per next check
            await Task.Delay(60000);
        }
    }
}