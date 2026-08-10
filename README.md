## Environment setup

__Server__

```
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install "trame<3.6" trame-vtk vtk itk
```

__Client__

```
cd react-client
npm i
npm run build
```
or from root
```
npm --prefix react-client install && npm --prefix react-client run build
```

## Executing example

```
source .venv/bin/activate
python ./trame-server.py --content ./react-client/dist --port 1234 --server
```


## Other
```
rm -rf .venv
```
