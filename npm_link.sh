WEBAPP_PATH=$PWD/../vocode-react-demo

rm -rf node_modules/react-dom
rm -rf node_modules/react
rm -rf node_modules/@types/react-dom
rm -rf node_modules/@types/react
rm -rf node_modules/@types/node

ln -s $WEBAPP_PATH/node_modules/react-dom node_modules/react-dom
ln -s $WEBAPP_PATH/node_modules/react node_modules/react
ln -s $WEBAPP_PATH/node_modules/@types/react-dom node_modules/@types/react-dom
ln -s $WEBAPP_PATH/node_modules/@types/react node_modules/@types/react
ln -s $WEBAPP_PATH/node_modules/@types/node node_modules/@types/node

ls -ld node_modules/react-dom
ls -ld node_modules/react
ls -ld node_modules/@types/react-dom
ls -ld node_modules/@types/react
ls -ld node_modules/@types/node
