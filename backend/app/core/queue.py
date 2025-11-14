# For testing purposes, we'll use a simple mock implementation
# In production, this would use Redis and RQ

class MockRedis:
    def __init__(self):
        pass

class MockQueue:
    def __init__(self, *args, **kwargs):
        pass
        
    def enqueue(self, func, *args, **kwargs):
        # Execute the function immediately for testing
        return func(*args, **kwargs)

# Use mock implementations for testing
redis_conn = MockRedis()
job_queue = MockQueue()
redis_available = False


def enqueue_job(file_id):
    from app.workers.worker import process_job
    # For testing, execute immediately
    process_job(file_id)