import json
from django.core.management.base import BaseCommand
from api.models import CrimeData
from django.db import transaction

class Command(BaseCommand):
    help = "Load crime data from a JSON file into the database"

    def handle(self, *args, **kwargs):
        file_path = 'api/management/data/merged_data.json'  # Path to your data file

        crime_data_objects = []

        with open(file_path, 'r') as file:
            for line in file:
                record = json.loads(line)  # Load each line as JSON

                # إدخال البيانات الأساسية للمنطقة
                community_area = record['Community Area']
                total_crimes = record['Total number of Crimes']
                total_crime_rate = record['Total Crime Rate']
                crime_insights = record['Crime Insights for Community Area']

                # تحقق من صحة JSON في حقل crime_insights
                try:
                    crimes_info_json = json.dumps(crime_insights)  # تخزين التفاصيل ك JSON
                except (TypeError, ValueError) as e:
                    self.stdout.write(self.style.WARNING(f'Invalid JSON for record: {record}. Error: {e}'))
                    continue  # تخطي السجل غير الصالح
                
                crime_count = total_crimes if total_crimes is not None else 0
                crime_rate = record.get('crime_rate', None)  

                if crime_rate is None:
                    print(f"Missing crime_rate for record: {record}")

                crime = CrimeData(
                    community_area=community_area,
                    primary_type=None,  # يمكن تركه None لأننا نخزن التفاصيل في حقل آخر
                    crime_count= crime_count,  # تعيين القيمة هنا
                    Total_number_of_Crimes=total_crimes,
                    crime_rate=crime_rate if crime_rate is not None else 0.0,
                    Total_crime_rate= total_crime_rate,
                    crimes_info= crimes_info_json,  # تخزين التفاصيل ك JSON
                    latitude=record.get('Latitude', 0.0),  # إضافة خط العرض إذا كان موجودًا
                    longitude=record.get('Longitude', 0.0)  # إضافة خط الطول إذا كان موجودًا
                )
                crime_data_objects.append(crime)

                # إدخال البيانات بكميات كبيرة لتفادي مشاكل الذاكرة
                if len(crime_data_objects) % 10000 == 0:
                    CrimeData.objects.bulk_create(crime_data_objects)
                    crime_data_objects = []  # تفريغ القائمة للدفعة التالية

        # إدخال أي سجلات متبقية
        if crime_data_objects:
            CrimeData.objects.bulk_create(crime_data_objects)

        self.stdout.write(self.style.SUCCESS('Data successfully loaded into the database.'))
