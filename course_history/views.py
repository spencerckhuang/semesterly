from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def csrf_cookie_view(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

class TranscriptUploadView(View):
    def post(self, request):
        print("POST method was triggered")  # For debugging purposes
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return JsonResponse({"error": "No file uploaded"}, status=400)
        # TODO: handle request
        return JsonResponse({"status": "success"})
