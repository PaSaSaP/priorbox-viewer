python3 -c "import numpy; n=numpy.fromfile('anchors.bin', dtype='float32'); n=n.reshape((len(n)//4, 4)); print('var priorboxes = ', end='');print([[y for y in x] for x in n])" > priorbox.js

