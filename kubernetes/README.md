## PeerPrep Kubernetes Horizontal Auto-Pod Scaling Guide

1. Install the latest metrics-server
`kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml`

2. Check that metrics-server is up with `kubectl get pods -n kube-system | grep metrics-server`
    * Common error: TLS certificate verification
      * Run `kubectl edit deployment metrics-server -n kube-system`
      * Add `- --kubelet-insecure-tls` under `args:`
      * Save and close the editor.
      * `kubectl rollout restart deployment metrics-server -n kube-system`

3. Build the PeerPrep Docker containers with `docker compose build`
4. Add your docker username in `deploy.sh` at root.
5. To deploy on Kubernetes, run `./deploy.sh` at root.
6. View deployments, pods and HPA. Ensure all services are running. `kubectl get all`
7. Wait for a few minutes for kubernetes to become fully functional. It is ready when running `kubectl get hpa` does not show any `<unknown>` under `TARGETS`
8. Load testing: 
    * In a separate terminal, run command to carry conduct load testing
    ```
    kubectl run -i --tty load-generator --rm --image=busybox:1.28 --restart=Never -- /bin/sh -c "while sleep 0.01; do wget -q -O- http://<service>.default.svc.cluster.local:<port>/<route>/test; done"
    ```
    * Replace `<service>`, `<port>` and `<route>` with the following, based on the service to test:
      1. User Service: `http://user-service.default.svc.cluster.local:3001/users/test`
      2. Question Service: `http://question-service.default.svc.cluster.local:3002/api/questions/test`
      3. Matching Service: `http://matching-service.default.svc.cluster.local:3003/api/matchtest`
      4. Collaboration Service: `http://collaboration-service.default.svc.cluster.local:3004/api/collab/test`
    * `Ctrl + C` to stop sending requests

9. Monitor autoscaling with `kubectl get hpa <service>-hpa --watch`. This command will watch the HPA in real-time, showing changes in replica counts and metrics. It requires a few minutes for the pods to scale up and down. Replace `<service>` appropriately with:
    * user-service
    * question-service
    * matching-service
    * collaboration-service

10. `Ctrl + C` to exit. To stop and delete to prevent resource wastage: `kubectl delete all --all`
