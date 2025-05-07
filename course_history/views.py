from django.http import JsonResponse
from django.views import View

class TranscriptUploadView(View):
    def post(self, request):

        uploaded_file = request.FILES.get("file")

        if not uploaded_file:
            return JsonResponse({"error": "No file uploaded"}, status=400)

        # TODO: Parse and process the transcript

        return JsonResponse({"success": True, "message": "Transcript uploaded successfully"})
