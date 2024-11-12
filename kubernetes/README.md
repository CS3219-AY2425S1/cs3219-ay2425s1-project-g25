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
4. Create the configmap for the nginx api-gateway: run `kubectl create configmap nginx-config --from-file=backend/api-gateway/nginx.conf` at root.
5. Create the configmap for mongo: run `kubectl create configmap init-mongo-script --from-file=init-mongo.js` at root.
6. Add your docker username in `deployKubernetes.sh` at root, replacing the existing username. Login is required. Run `docker login` in terminal and input your credentials if not yet logged in.
7. To deploy on Kubernetes, run `./deployKubernetes.sh` at root.
8. View deployments, pods and HPA. Ensure all services are running. `kubectl get all`
9. Wait for a few minutes for kubernetes to become fully functional. It is ready when running `kubectl get hpa` does not show any `<unknown>` under `TARGETS`. For optimal testing performance, wait a few more minutes for the services to fully start and scale back down to 1 replica, as the services will scale up during startup due to greater utilization. Some services might not scale back down to 1 replica and might remain and 2-3 replicas instead.
10. Load testing: 
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
    * Testing can also be done on our deployed instance, by replacing the address with `52.221.131.145`. For example, `http://52.221.131.145:3001/users/test`. However, this is unlikely to result in any scaling due to Amazon EC2 throttling EC2 API requests for each AWS account on a per-Region basis, hence limiting the load imposed on each service.

11. Monitor autoscaling with `kubectl get hpa <service>-hpa --watch`. This command will watch the HPA in real-time, showing changes in replica counts and metrics. It requires a few minutes for the pods to scale up and down. Replace `<service>` appropriately with:
    * user-service
    * question-service
    * matching-service
    * collaboration-service

12. `Ctrl + C` to exit. To stop and delete to prevent resource wastage: `kubectl delete all --all`
