namespace RestRoutes;

using System.Collections.Concurrent;

public class SseConnectionManager
{
    // Track connections by content type
    private readonly ConcurrentDictionary<string, ConcurrentBag<SseConnection>> _connections = new();

    public void AddConnection(string contentType, SseConnection connection)
    {
        var bag = _connections.GetOrAdd(contentType, _ => new ConcurrentBag<SseConnection>());
        bag.Add(connection);
    }

    public void RemoveConnection(string contentType, SseConnection connection)
    {
        if (_connections.TryGetValue(contentType, out var bag))
        {
            // Mark as disconnected so background service can skip it
            connection.IsConnected = false;
        }
    }

    public IEnumerable<SseConnection> GetConnections(string contentType)
    {
        if (_connections.TryGetValue(contentType, out var bag))
        {
            // Filter out disconnected connections
            return bag.Where(c => c.IsConnected);
        }
        return Enumerable.Empty<SseConnection>();
    }

    public IEnumerable<string> GetAllContentTypes()
    {
        return _connections.Keys;
    }

    public void CleanupDisconnected()
    {
        foreach (var kvp in _connections)
        {
            var contentType = kvp.Key;
            var connections = kvp.Value;

            // If all connections are disconnected, remove the bag
            if (connections.All(c => !c.IsConnected))
            {
                _connections.TryRemove(contentType, out _);
            }
        }
    }
}

public class SseConnection
{
    public StreamWriter Writer { get; set; }
    public string ContentType { get; set; }
    public IQueryCollection QueryFilters { get; set; }
    public bool IsConnected { get; set; } = true;
    public CancellationToken CancellationToken { get; set; }

    public SseConnection(StreamWriter writer, string contentType, IQueryCollection queryFilters, CancellationToken cancellationToken)
    {
        Writer = writer;
        ContentType = contentType;
        QueryFilters = queryFilters;
        CancellationToken = cancellationToken;
    }
}