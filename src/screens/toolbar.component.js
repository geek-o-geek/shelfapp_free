
import React from 'react';
import { Col, Row, Grid } from "react-native-easy-grid";
import { View, TouchableWithoutFeedback } from 'react-native';

import styles from '../assets/styles/camera';

export default ({ 
    capturing = false, 
    onCaptureIn, onCaptureOut, onLongCapture, onShortCapture, 
}) => (
    <Grid style={styles.bottomToolbar}>
        <Row>
            <Col style={styles.alignCenter}>
               
            </Col>
            <Col size={2} style={styles.alignCenter}>
                <TouchableWithoutFeedback
                    onPressIn={onCaptureIn}
                    onPressOut={onCaptureOut}
                    onLongPress={onLongCapture}
                    onPress={onShortCapture}>
                    <View style={[styles.captureBtn, capturing && styles.captureBtnActive]}>
                        {capturing && <View style={styles.captureBtnInternal} />}
                    </View>
                </TouchableWithoutFeedback>
            </Col>
            <Col style={styles.alignCenter}>
              
            </Col>
        </Row>
    </Grid>
);