import sys
import os

if os.path.exists(f'uploads/{sys.argv[1]}.zip'):
    print('success')
    print(os.listdir('uploads'))
else:
    print('fail')