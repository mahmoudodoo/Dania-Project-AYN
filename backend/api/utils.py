
from rest_framework.response import Response
from .models import News
from .serializers import NewsSerializer


def getNotesList(request):
    notes = News.objects.all().order_by('-updated')
    serializer = NewsSerializer(notes, many=True)
    return Response(serializer.data)


def getNoteDetail(request, pk):
    notes = News.objects.get(id=pk)
    serializer = NewsSerializer(notes, many=False)
    return Response(serializer.data)


def createNote(request):
    data = request.data
    note = News.objects.create(
        body=data['body'],
        title=data['title'],
        image=data["image"]
    )
    serializer = NewsSerializer(note, many=False)
    return Response(serializer.data)

def updateNote(request, pk):
    data = request.data
    note = News.objects.get(id=pk)
    serializer = NewsSerializer(instance=note, data=data)

    if serializer.is_valid():
        serializer.save()

    return serializer.data


def deleteNote(request, pk):
    note = News.objects.get(id=pk)
    note.delete()
    return Response('Note was deleted!')